import { pool, query } from '../config/db.js';
import { broadcastAdminEvent } from '../services/realtime.js';

/**
 * Generates an elegant order reference code, e.g.: VAG-2026-894215
 */
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `VAG-${year}-${random}`;
}

/**
 * POST /api/orders
 * Create a new order with multiple items inside a PostgreSQL transaction
 */
export async function createOrder(req, res, next) {
  const client = await pool.connect();

  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      state,
      postalCode,
      country = 'India',
      items,
      paymentMethod = 'cod',
      couponCode = null,
      discountAmount = 0,
      notes,
    } = req.body;

    // Validate customer contact & shipping details
    if (!customerName || !email || !phone || !shippingAddress || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'All contact and shipping address fields are required.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping bag is empty. Please add items to checkout.',
      });
    }

    await client.query('BEGIN');

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Verify each product, price, and stock
    for (const item of items) {
      const productId = item.id;
      const quantity = Math.max(1, parseInt(item.q || item.quantity || 1, 10));

      const prodRes = await client.query(
        'SELECT id, name, price, stock, image_url FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );

      if (prodRes.rows.length === 0) {
        // If product not found in DB (e.g. mock fallback item), use provided price safely
        const itemPrice = Number(item.p || item.price || 0);
        const itemSubtotal = itemPrice * quantity;
        calculatedSubtotal += itemSubtotal;
        verifiedItems.push({
          productId: null,
          productName: item.n || item.name || `Saree #${productId}`,
          price: itemPrice,
          quantity,
          subtotal: itemSubtotal,
          imageUrl: item.image || item.imageUrl || null,
        });
      } else {
        const dbProduct = prodRes.rows[0];
        const itemPrice = Number(dbProduct.price);
        const itemSubtotal = itemPrice * quantity;
        calculatedSubtotal += itemSubtotal;

        // Decrement stock if available
        if (dbProduct.stock < quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in atelier.`,
          });
        }

        await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
          quantity,
          dbProduct.id,
        ]);

        verifiedItems.push({
          productId: dbProduct.id,
          productName: dbProduct.name,
          price: itemPrice,
          quantity,
          subtotal: itemSubtotal,
          imageUrl: item.image || item.imageUrl || dbProduct.image_url,
        });
      }
    }

    const shippingFee = 0.0; // Complimentary luxury shipping
    const parsedDiscount = Number(discountAmount) || 0;
    const totalAmount = Math.max(0, calculatedSubtotal - parsedDiscount + shippingFee);
    const orderNumber = generateOrderNumber();
    const userId = req.user ? req.user.id : null;

    const initialTimeline = JSON.stringify([
      {
        time: new Date().toISOString(),
        status: 'placed',
        note: 'Order successfully placed by patron.',
      },
    ]);

    // Insert order record
    const orderInsertSql = `
      INSERT INTO orders (
        order_number, user_id, customer_name, email, phone, shipping_address,
        city, state, postal_code, country, subtotal, discount_amount, coupon_code, shipping_fee, total_amount,
        payment_method, payment_status, order_status, notes, timeline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const orderRes = await client.query(orderInsertSql, [
      orderNumber,
      userId,
      customerName.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      shippingAddress.trim(),
      city.trim(),
      state.trim(),
      postalCode.trim(),
      country,
      calculatedSubtotal,
      parsedDiscount,
      couponCode || null,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentMethod === 'cod' ? 'pending' : 'completed',
      'placed',
      notes || null,
      initialTimeline,
    ]);

    const createdOrder = orderRes.rows[0];

    // Insert order items
    for (const vItem of verifiedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          createdOrder.id,
          vItem.productId,
          vItem.productName,
          vItem.price,
          vItem.quantity,
          vItem.subtotal,
          vItem.imageUrl,
        ]
      );
    }

    await client.query('COMMIT');

    // Broadcast Realtime Event to Admin Dashboard
    try {
      broadcastAdminEvent('order:created', {
        id: createdOrder.id,
        orderNumber,
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        totalAmount,
        subtotal: calculatedSubtotal,
        discountAmount: parsedDiscount,
        paymentMethod,
        paymentStatus: createdOrder.payment_status,
        orderStatus: 'placed',
        itemsCount: verifiedItems.length,
        items: verifiedItems,
        createdAt: createdOrder.created_at,
      });

      broadcastAdminEvent('inventory:adjusted', {
        reason: `Order #${orderNumber} checkout deduction`,
        items: verifiedItems,
      });
    } catch (realtimeErr) {
      console.error('[Realtime Broadcast Error]:', realtimeErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Thank you for choosing Vaagai.',
      order: {
        ...createdOrder,
        items: verifiedItems,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders/my
 * Fetch all orders placed by the authenticated customer
 */
export async function getMyOrders(req, res, next) {
  try {
    const ordersResult = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsRes.rows;
    }

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:orderNumber
 * Fetch order details by order number (with optional email verification for guests)
 */
export async function getOrderByNumber(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    const orderRes = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with the provided reference number.',
      });
    }

    const order = orderRes.rows[0];

    // Privacy check for guest lookups: if user is not admin and not the order owner, verify email
    const isOwner = req.user && req.user.id === order.user_id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      if (!email || email.trim().toLowerCase() !== order.email.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Please provide the email address associated with this order to view tracking details.',
        });
      }
    }

    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    order.items = itemsRes.rows;

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders (Admin only)
 * Retrieve all orders in the system with filtering
 */
export async function getAllOrders(req, res, next) {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`order_status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) FROM orders ${whereClause}`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const dataSql = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const dataRes = await query(dataSql, params);
    const orders = dataRes.rows;

    for (const order of orders) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsRes.rows;
    }

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/orders/:id/status (Admin only)
 * Update order and payment status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const result = await query(
      `UPDATE orders
       SET order_status = COALESCE($1, order_status),
           payment_status = COALESCE($2, payment_status),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [orderStatus, paymentStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      order: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:orderNumber/cancel
 * Cancel order if placed or confirmed
 */
export async function cancelOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const { reason = 'Customer requested cancellation', email } = req.body;

    const ordRes = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (ordRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = ordRes.rows[0];

    // Auth verification
    if (req.user && req.user.role !== 'admin' && req.user.id !== order.user_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order.' });
    }
    if (!req.user && email && email.toLowerCase() !== order.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Invalid customer email for this order.' });
    }

    if (order.order_status !== 'placed' && order.order_status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in "${order.order_status}" status. Please contact concierge support.`,
      });
    }

    // Parse timeline
    let timeline = [];
    try {
      timeline = typeof order.timeline === 'string' ? JSON.parse(order.timeline) : (order.timeline || []);
    } catch {
      timeline = [];
    }
    timeline.push({
      time: new Date().toISOString(),
      status: 'cancelled',
      note: `Order cancelled by patron: ${reason}`,
    });

    // Update order
    const updated = await query(`
      UPDATE orders
      SET order_status = 'cancelled',
          payment_status = CASE WHEN payment_status = 'completed' THEN 'refund_pending' ELSE 'cancelled' END,
          timeline = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify(timeline), order.id]);

    // Restore stock
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of itemsRes.rows) {
      if (item.product_id) {
        await query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
      }
    }

    // Realtime broadcast to admin
    try {
      broadcastAdminEvent('order:status_updated', {
        order_id: order.id,
        order_number: order.order_number,
        order_status: 'cancelled',
        payment_status: updated.rows[0].payment_status,
      });
      broadcastAdminEvent('inventory:adjusted', {
        reason: `Restocked after order #${order.order_number} cancellation`,
      });
    } catch {}

    res.json({
      success: true,
      message: 'Order cancelled successfully. Restock processed and refund initiated where applicable.',
      order: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:orderNumber/return
 * Request a return for a delivered order
 */
export async function requestOrderReturn(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const { productId, reason, description, email } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Return reason is required.' });
    }

    const ordRes = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (ordRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = ordRes.rows[0];

    // Auth verification
    if (req.user && req.user.role !== 'admin' && req.user.id !== order.user_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to request return for this order.' });
    }
    if (!req.user && email && email.toLowerCase() !== order.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Invalid customer email for this order.' });
    }

    if (order.order_status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested after the saree drape has been delivered.',
      });
    }

    // Get item details
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const targetItem = productId ? itemsRes.rows.find(i => i.product_id == productId) : itemsRes.rows[0];
    const productName = targetItem ? targetItem.product_name : 'Luxury Saree Drape';
    const refundAmount = targetItem ? targetItem.subtotal : order.total_amount;

    // Insert return record
    const insReturn = await query(`
      INSERT INTO order_returns (
        order_id, order_number, user_id, customer_name, customer_email,
        product_id, product_name, reason, description, status, refund_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'requested', $10)
      RETURNING *
    `, [
      order.id,
      order.order_number,
      order.user_id || (req.user ? req.user.id : null),
      order.customer_name,
      order.email,
      targetItem ? targetItem.product_id : null,
      productName,
      reason,
      description || null,
      refundAmount,
    ]);

    // Update order status & timeline
    let timeline = [];
    try {
      timeline = typeof order.timeline === 'string' ? JSON.parse(order.timeline) : (order.timeline || []);
    } catch {
      timeline = [];
    }
    timeline.push({
      time: new Date().toISOString(),
      status: 'return_requested',
      note: `Return requested by patron: ${reason}`,
    });

    await query(`
      UPDATE orders
      SET order_status = 'return_requested',
          timeline = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(timeline), order.id]);

    // Broadcast to Admin
    try {
      broadcastAdminEvent('order:status_updated', {
        order_id: order.id,
        order_number: order.order_number,
        order_status: 'return_requested',
      });
      broadcastAdminEvent('return:requested', insReturn.rows[0]);
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Our atelier concierge will review within 24 hours.',
      returnRequest: insReturn.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
