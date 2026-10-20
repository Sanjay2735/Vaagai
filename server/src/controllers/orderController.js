import { pool, query } from '../config/db.js';

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
    const totalAmount = calculatedSubtotal + shippingFee;
    const orderNumber = generateOrderNumber();
    const userId = req.user ? req.user.id : null;

    // Insert order record
    const orderInsertSql = `
      INSERT INTO orders (
        order_number, user_id, customer_name, email, phone, shipping_address,
        city, state, postal_code, country, subtotal, shipping_fee, total_amount,
        payment_method, payment_status, order_status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentMethod === 'cod' ? 'pending' : 'completed',
      'placed',
      notes || null,
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
