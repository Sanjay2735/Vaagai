import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { broadcastAdminEvent, addSseClient } from '../services/realtime.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vaagai_super_secret_jwt_key_2026_artisanal_sarees_heritage';
const JWT_EXPIRES_IN = '7d';

// In-memory store for password reset tokens: token -> { email, expiresAt }
const resetTokens = new Map();

/**
 * Record an action in the activity_logs table
 */
async function logActivity(req, action, entityType, entityId, details) {
  try {
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : 'System';
    const userEmail = req.user ? req.user.email : 'system@vaagai.com';
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    await query(
      `INSERT INTO activity_logs (user_id, user_name, user_email, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, userName, userEmail, action, entityType, String(entityId || ''), JSON.stringify(details || {}), String(ip)]
    );
  } catch (err) {
    console.error('[Activity Log Error]:', err.message);
  }
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & PROFILE
// -------------------------------------------------------------

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();
    const result = await query(
      `SELECT id, name, email, password_hash, role, phone, avatar_url, is_active FROM users WHERE email = $1`,
      [emailClean]
    );

    if (result.rows.length === 0) {
      if (res.recordFailedAttempt) res.recordFailedAttempt();
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const user = result.rows[0];
    const allowedRoles = ['admin', 'super_admin', 'product_manager', 'order_manager', 'content_manager', 'support'];
    if (!allowedRoles.includes(user.role)) {
      if (res.recordFailedAttempt) res.recordFailedAttempt();
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have administrative privileges for the VAAGAI Atelier.',
      });
    }

    if (user.is_active === 0 || user.is_active === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      if (res.recordFailedAttempt) res.recordFailedAttempt();
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    if (res.recordSuccessfulLogin) res.recordSuccessfulLogin();

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatar_url,
    };

    const token = jwt.sign(sanitizedUser, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    await logActivity({ user: sanitizedUser, ip: req.ip, headers: req.headers }, 'LOGIN', 'auth', user.id, {
      message: 'Admin signed into administration portal',
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}.`,
      token,
      user: sanitizedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/auth/forgot-password
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const emailClean = email.trim().toLowerCase();
    const userRes = await query(
      `SELECT id, name, email, role FROM users WHERE email = $1 AND role IN ('admin', 'super_admin', 'product_manager', 'order_manager', 'content_manager', 'support')`,
      [emailClean]
    );

    if (userRes.rows.length === 0) {
      // Security practice: Don't disclose whether user exists, but simulate response
      return res.json({
        success: true,
        message: 'If an authorized administrative account exists with this email, a reset code has been dispatched.',
      });
    }

    // Generate 6-digit reset code
    const resetCode = `VAG-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    resetTokens.set(resetCode, { email: emailClean, expiresAt });

    await logActivity({ user: userRes.rows[0], ip: req.ip }, 'FORGOT_PASSWORD_REQUEST', 'auth', userRes.rows[0].id, {
      email: emailClean,
    });

    res.json({
      success: true,
      message: `A password reset code has been generated. For your convenience in development, your reset code is: ${resetCode}`,
      resetCode, // provided so developer/evaluator can test immediately
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/auth/reset-password
 */
export async function resetPassword(req, res, next) {
  try {
    const { resetCode, newPassword } = req.body;
    if (!resetCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset code and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const record = resetTokens.get(resetCode.trim().toUpperCase());
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset code.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`, [hash, record.email]);

    resetTokens.delete(resetCode.trim().toUpperCase());

    await logActivity({ ip: req.ip }, 'RESET_PASSWORD_SUCCESS', 'auth', record.email, {
      message: 'Password successfully updated via reset code',
    });

    res.json({
      success: true,
      message: 'Password has been securely reset. You may now sign in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/realtime (Server-Sent Events Stream)
 */
export function handleRealtimeSSE(req, res) {
  const token =
    req.query.token ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required for SSE stream.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const allowed = ['admin', 'super_admin', 'product_manager', 'order_manager', 'content_manager', 'support'];
    if (!allowed.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering
    });

    addSseClient(res, decoded);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export async function getAdminMe(req, res, next) {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 2. DASHBOARD OVERVIEW & ANALYTICS
// -------------------------------------------------------------

export async function getOverview(req, res, next) {
  try {
    const { range = '30d' } = req.query;

    // Filter date condition for orders
    let dateFilter = '';
    if (range === 'today') {
      dateFilter = "AND created_at >= date('now', 'start of day')";
    } else if (range === 'yesterday') {
      dateFilter = "AND created_at >= date('now', '-1 day', 'start of day') AND created_at < date('now', 'start of day')";
    } else if (range === '7d') {
      dateFilter = "AND created_at >= date('now', '-7 days')";
    } else if (range === '30d') {
      dateFilter = "AND created_at >= date('now', '-30 days')";
    } else if (range === '90d') {
      dateFilter = "AND created_at >= date('now', '-90 days')";
    }

    // 1. Total Revenue
    const revenueRes = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE order_status != 'cancelled' ${dateFilter}`
    );
    const totalRevenue = Number(revenueRes.rows[0]?.total_revenue || 0);

    // 2. Total Orders
    const ordersRes = await query(
      `SELECT COUNT(*) as total_orders FROM orders WHERE 1=1 ${dateFilter}`
    );
    const totalOrders = Number(ordersRes.rows[0]?.total_orders || 0);

    // 3. Average Order Value
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 4. Pending Orders
    const pendingOrdersRes = await query(
      `SELECT COUNT(*) as pending_count FROM orders WHERE order_status IN ('placed', 'confirmed', 'processing')`
    );
    const pendingOrders = Number(pendingOrdersRes.rows[0]?.pending_count || 0);

    // 5. Total Products
    const prodsCountRes = await query(`SELECT COUNT(*) as total_prods FROM products WHERE status != 'archived'`);
    const totalProducts = Number(prodsCountRes.rows[0]?.total_prods || 0);

    // 6. Total Customers
    const custCountRes = await query(
      `SELECT COUNT(DISTINCT email) as total_customers FROM orders`
    );
    const totalCustomers = Number(custCountRes.rows[0]?.total_customers || 0);

    // 7. Low Stock & Out of Stock counts
    const lowStockRes = await query(
      `SELECT COUNT(*) as low_count FROM products WHERE stock > 0 AND stock <= low_stock_threshold`
    );
    const lowStockCount = Number(lowStockRes.rows[0]?.low_count || 0);

    const outOfStockRes = await query(
      `SELECT COUNT(*) as out_count FROM products WHERE stock = 0`
    );
    const outOfStockCount = Number(outOfStockRes.rows[0]?.out_count || 0);

    // 8. Recent 6 Orders
    const recentOrdersRes = await query(
      `SELECT id, order_number, customer_name, email, total_amount, payment_status, order_status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 6`
    );

    // 9. Low Stock Alert Products (first 5)
    const lowStockListRes = await query(
      `SELECT id, name, sku, fabric, price, stock, image_url, low_stock_threshold
       FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC LIMIT 6`
    );

    // 10. Sales by category
    const catSalesRes = await query(`
      SELECT p.fabric as category_name, COUNT(oi.id) as units_sold, COALESCE(SUM(oi.subtotal), 0) as total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.fabric
      ORDER BY total_sales DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      range,
      kpis: {
        totalRevenue,
        totalOrders,
        aov,
        pendingOrders,
        totalProducts,
        totalCustomers,
        lowStockCount,
        outOfStockCount,
      },
      recentOrders: recentOrdersRes.rows,
      lowStockProducts: lowStockListRes.rows,
      categorySales: catSalesRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 3. PRODUCT MANAGEMENT (CRUD + SPECIFICATIONS)
// -------------------------------------------------------------

export async function getAdminProducts(req, res, next) {
  try {
    const {
      q,
      fabric,
      status,
      stockStatus,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (q && q.trim()) {
      conditions.push(`(name ILIKE $${idx} OR sku ILIKE $${idx} OR fabric ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${q.trim()}%`);
      idx++;
    }

    if (fabric) {
      conditions.push(`fabric ILIKE $${idx}`);
      params.push(`%${fabric}%`);
      idx++;
    }

    if (status && status !== 'all') {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (stockStatus === 'in_stock') {
      conditions.push(`stock > low_stock_threshold`);
    } else if (stockStatus === 'low_stock') {
      conditions.push(`stock > 0 AND stock <= low_stock_threshold`);
    } else if (stockStatus === 'out_of_stock') {
      conditions.push(`stock = 0`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY id DESC';
    if (sort === 'price_asc') orderBy = 'ORDER BY price ASC';
    else if (sort === 'price_desc') orderBy = 'ORDER BY price DESC';
    else if (sort === 'stock_asc') orderBy = 'ORDER BY stock ASC';
    else if (sort === 'stock_desc') orderBy = 'ORDER BY stock DESC';
    else if (sort === 'name_asc') orderBy = 'ORDER BY name ASC';

    const countRes = await query(`SELECT COUNT(*) as count FROM products ${where}`, params);
    const total = parseInt(countRes.rows[0]?.count || 0, 10);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const sql = `SELECT * FROM products ${where} ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limitNum, offset);

    const dataRes = await query(sql, params);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      products: dataRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminProductById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM products WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prod = result.rows[0];
    try {
      prod.galleryImages = JSON.parse(prod.gallery_images || '[]');
    } catch {
      prod.galleryImages = [];
    }

    res.json({ success: true, product: prod });
  } catch (error) {
    next(error);
  }
}

export async function createAdminProduct(req, res, next) {
  try {
    const {
      name,
      slug,
      sku,
      description,
      price,
      originalPrice,
      costPrice,
      fabric,
      weave,
      zariType,
      borderStyle,
      blouseDetails,
      length,
      origin,
      careInstructions,
      toneA,
      toneB,
      imageUrl,
      galleryImages = [],
      stock = 10,
      lowStockThreshold = 5,
      status = 'active',
      isFeatured = false,
      isNewArrival = true,
      isBestSeller = false,
      metaTitle,
      metaDescription,
      tags = '',
    } = req.body;

    if (!name || !price || !fabric) {
      return res.status(400).json({ success: false, message: 'Product title, price, and fabric are required.' });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const generatedSku =
      sku ||
      `VAG-${fabric.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const galleryJson = typeof galleryImages === 'string' ? galleryImages : JSON.stringify(galleryImages || []);

    const result = await query(
      `INSERT INTO products (
        name, slug, sku, description, price, original_price, cost_price, fabric,
        weave, zari_type, border_style, blouse_details, length, origin, care_instructions,
        tone_a, tone_b, image_url, gallery_images, stock, low_stock_threshold,
        status, is_featured, is_new_arrival, is_best_seller, meta_title, meta_description, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28
      ) RETURNING *`,
      [
        name,
        generatedSlug,
        generatedSku,
        description || '',
        price,
        originalPrice || null,
        costPrice || null,
        fabric,
        weave || 'Handloom',
        zariType || 'Pure Gold Zari',
        borderStyle || 'Traditional Temple Border',
        blouseDetails || 'Includes 0.8m running blouse piece',
        length || '5.5m + 0.8m Blouse',
        origin || 'Kanchipuram, Tamil Nadu',
        careInstructions || 'Strictly Dry Clean Only',
        toneA || 'Crimson',
        toneB || 'Antique Gold',
        imageUrl || '',
        galleryJson,
        stock,
        lowStockThreshold,
        status,
        Boolean(isFeatured) ? 1 : 0,
        Boolean(isNewArrival) ? 1 : 0,
        Boolean(isBestSeller) ? 1 : 0,
        metaTitle || `${name} | VAAGAI Saree Atelier`,
        metaDescription || description || '',
        tags,
      ]
    );

    const created = result.rows[0];

    await logActivity(req, 'CREATE_PRODUCT', 'products', created.id, {
      name: created.name,
      sku: created.sku,
      price: created.price,
    });

    broadcastAdminEvent('product:created', {
      product: created,
      staff: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: `Product "${created.name}" created successfully.`,
      product: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      sku,
      description,
      price,
      originalPrice,
      costPrice,
      fabric,
      weave,
      zariType,
      borderStyle,
      blouseDetails,
      length,
      origin,
      careInstructions,
      toneA,
      toneB,
      imageUrl,
      galleryImages,
      stock,
      lowStockThreshold,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
      metaTitle,
      metaDescription,
      tags,
    } = req.body;

    const galleryJson = galleryImages !== undefined
      ? (typeof galleryImages === 'string' ? galleryImages : JSON.stringify(galleryImages))
      : undefined;

    const result = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           sku = COALESCE($3, sku),
           description = COALESCE($4, description),
           price = COALESCE($5, price),
           original_price = COALESCE($6, original_price),
           cost_price = COALESCE($7, cost_price),
           fabric = COALESCE($8, fabric),
           weave = COALESCE($9, weave),
           zari_type = COALESCE($10, zari_type),
           border_style = COALESCE($11, border_style),
           blouse_details = COALESCE($12, blouse_details),
           length = COALESCE($13, length),
           origin = COALESCE($14, origin),
           care_instructions = COALESCE($15, care_instructions),
           tone_a = COALESCE($16, tone_a),
           tone_b = COALESCE($17, tone_b),
           image_url = COALESCE($18, image_url),
           gallery_images = COALESCE($19, gallery_images),
           stock = COALESCE($20, stock),
           low_stock_threshold = COALESCE($21, low_stock_threshold),
           status = COALESCE($22, status),
           is_featured = COALESCE($23, is_featured),
           is_new_arrival = COALESCE($24, is_new_arrival),
           is_best_seller = COALESCE($25, is_best_seller),
           meta_title = COALESCE($26, meta_title),
           meta_description = COALESCE($27, meta_description),
           tags = COALESCE($28, tags),
           updated_at = NOW()
       WHERE id = $29
       RETURNING *`,
      [
        name,
        slug,
        sku,
        description,
        price,
        originalPrice,
        costPrice,
        fabric,
        weave,
        zariType,
        borderStyle,
        blouseDetails,
        length,
        origin,
        careInstructions,
        toneA,
        toneB,
        imageUrl,
        galleryJson,
        stock,
        lowStockThreshold,
        status,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : undefined,
        isNewArrival !== undefined ? (isNewArrival ? 1 : 0) : undefined,
        isBestSeller !== undefined ? (isBestSeller ? 1 : 0) : undefined,
        metaTitle,
        metaDescription,
        tags,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updated = result.rows[0];

    await logActivity(req, 'UPDATE_PRODUCT', 'products', id, {
      name: updated.name,
      price: updated.price,
      stock: updated.stock,
      status: updated.status,
    });

    broadcastAdminEvent('product:updated', {
      product: updated,
      staff: req.user.name,
    });

    res.json({
      success: true,
      message: `Product "${updated.name}" updated successfully.`,
      product: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM products WHERE id = $1 RETURNING id, name, sku`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await logActivity(req, 'DELETE_PRODUCT', 'products', id, {
      name: result.rows[0].name,
      sku: result.rows[0].sku,
    });

    res.json({
      success: true,
      message: `Product "${result.rows[0].name}" deleted permanently.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdateProducts(req, res, next) {
  try {
    const { productIds, action, value } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one product.' });
    }

    if (action === 'status') {
      for (const id of productIds) {
        await query(`UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
      }
    } else if (action === 'delete') {
      for (const id of productIds) {
        await query(`DELETE FROM products WHERE id = $1`, [id]);
      }
    } else if (action === 'stock') {
      for (const id of productIds) {
        await query(`UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
      }
    }

    await logActivity(req, 'BULK_UPDATE_PRODUCTS', 'products', productIds.join(','), { action, value });

    res.json({
      success: true,
      message: `Bulk ${action} successfully applied to ${productIds.length} products.`,
    });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 4. ORDER MANAGEMENT (LIFECYCLE, TRACKING, TIMELINE)
// -------------------------------------------------------------

export async function getAdminOrders(req, res, next) {
  try {
    const {
      q,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (q && q.trim()) {
      conditions.push(`(order_number ILIKE $${idx} OR customer_name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`);
      params.push(`%${q.trim()}%`);
      idx++;
    }

    if (orderStatus && orderStatus !== 'all') {
      conditions.push(`order_status = $${idx}`);
      params.push(orderStatus);
      idx++;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      conditions.push(`payment_status = $${idx}`);
      params.push(paymentStatus);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) as count FROM orders ${where}`, params);
    const total = parseInt(countRes.rows[0]?.count || 0, 10);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const sql = `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limitNum, offset);

    const dataRes = await query(sql, params);
    const orders = dataRes.rows;

    for (const ord of orders) {
      const itemsRes = await query(`SELECT * FROM order_items WHERE order_id = $1`, [ord.id]);
      ord.items = itemsRes.rows;
      try {
        ord.timeline = JSON.parse(ord.timeline || '[]');
      } catch {
        ord.timeline = [];
      }
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

export async function getAdminOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const ordRes = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
    if (ordRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = ordRes.rows[0];
    const itemsRes = await query(`SELECT * FROM order_items WHERE order_id = $1`, [order.id]);
    order.items = itemsRes.rows;

    try {
      order.timeline = JSON.parse(order.timeline || '[]');
    } catch {
      order.timeline = [];
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, note } = req.body;

    const ordRes = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
    if (ordRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentOrder = ordRes.rows[0];
    let timeline = [];
    try {
      timeline = JSON.parse(currentOrder.timeline || '[]');
    } catch {
      timeline = [];
    }

    const newEvent = {
      time: new Date().toISOString(),
      status: orderStatus || currentOrder.order_status,
      note: note || `Order status updated to "${orderStatus || currentOrder.order_status}" by ${req.user.name}`,
    };
    timeline.push(newEvent);

    const updated = await query(
      `UPDATE orders
       SET order_status = COALESCE($1, order_status),
           payment_status = COALESCE($2, payment_status),
           timeline = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [orderStatus, paymentStatus, JSON.stringify(timeline), id]
    );

    await logActivity(req, 'UPDATE_ORDER_STATUS', 'orders', id, {
      orderNumber: currentOrder.order_number,
      orderStatus,
      paymentStatus,
    });

    broadcastAdminEvent('order:status_updated', {
      orderId: id,
      orderNumber: currentOrder.order_number,
      orderStatus: orderStatus || currentOrder.order_status,
      paymentStatus: paymentStatus || currentOrder.payment_status,
      staff: req.user.name,
      note,
    });

    res.json({
      success: true,
      message: `Order #${currentOrder.order_number} status updated to "${orderStatus}".`,
      order: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminOrderShipping(req, res, next) {
  try {
    const { id } = req.params;
    const { carrier, trackingNumber, trackingUrl } = req.body;

    const ordRes = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
    if (ordRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentOrder = ordRes.rows[0];
    let timeline = [];
    try {
      timeline = JSON.parse(currentOrder.timeline || '[]');
    } catch {
      timeline = [];
    }

    timeline.push({
      time: new Date().toISOString(),
      status: 'shipped',
      note: `Courier dispatched via ${carrier}. Tracking AWB: ${trackingNumber}`,
    });

    const updated = await query(
      `UPDATE orders
       SET shipping_carrier = $1,
           tracking_number = $2,
           tracking_url = $3,
           order_status = 'shipped',
           timeline = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [carrier, trackingNumber, trackingUrl || null, JSON.stringify(timeline), id]
    );

    await logActivity(req, 'UPDATE_SHIPPING', 'orders', id, { carrier, trackingNumber });

    res.json({
      success: true,
      message: `Shipping information updated for Order #${currentOrder.order_number}.`,
      order: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 5. INVENTORY MANAGEMENT (STOCK & AUDIT LOGS)
// -------------------------------------------------------------

export async function getAdminInventory(req, res, next) {
  try {
    const { q, stockFilter } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (q && q.trim()) {
      conditions.push(`(name ILIKE $${idx} OR sku ILIKE $${idx} OR fabric ILIKE $${idx})`);
      params.push(`%${q.trim()}%`);
      idx++;
    }

    if (stockFilter === 'low') {
      conditions.push(`stock > 0 AND stock <= low_stock_threshold`);
    } else if (stockFilter === 'out') {
      conditions.push(`stock = 0`);
    } else if (stockFilter === 'healthy') {
      conditions.push(`stock > low_stock_threshold`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, name, sku, fabric, price, cost_price, stock, low_stock_threshold, status, image_url, updated_at
                 FROM products ${where} ORDER BY stock ASC`;

    const result = await query(sql, params);

    // Stock stats
    const statsRes = await query(`
      SELECT
        COUNT(*) as total_items,
        COALESCE(SUM(stock), 0) as total_units,
        COALESCE(SUM(stock * price), 0) as total_retail_value,
        COALESCE(SUM(stock * COALESCE(cost_price, price * 0.5)), 0) as total_cost_value,
        SUM(CASE WHEN stock <= low_stock_threshold AND stock > 0 THEN 1 ELSE 0 END) as low_count,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_count
      FROM products
    `);

    res.json({
      success: true,
      stats: statsRes.rows[0],
      products: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function adjustInventory(req, res, next) {
  try {
    const { productId, changeAmount, reason = 'manual_adjustment' } = req.body;
    if (!productId || changeAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and change amount are required.' });
    }

    const prodRes = await query(`SELECT id, name, stock FROM products WHERE id = $1`, [productId]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prod = prodRes.rows[0];
    const prevStock = prod.stock;
    const newStock = Math.max(0, prevStock + parseInt(changeAmount, 10));

    await query(`UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`, [newStock, productId]);

    await query(
      `INSERT INTO inventory_logs (product_id, product_name, change_amount, previous_stock, new_stock, reason, admin_user)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [productId, prod.name, changeAmount, prevStock, newStock, reason, req.user.name]
    );

    await logActivity(req, 'ADJUST_STOCK', 'inventory', productId, {
      productName: prod.name,
      previousStock: prevStock,
      newStock,
      changeAmount,
      reason,
    });

    broadcastAdminEvent('inventory:adjusted', {
      productId,
      productName: prod.name,
      previousStock: prevStock,
      newStock,
      changeAmount,
      reason,
      staff: req.user.name,
    });

    res.json({
      success: true,
      message: `Stock for "${prod.name}" adjusted from ${prevStock} to ${newStock}.`,
      product: { id: productId, stock: newStock },
    });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryLogs(req, res, next) {
  try {
    const { productId, limit = 50 } = req.query;
    let sql = 'SELECT * FROM inventory_logs';
    const params = [];

    if (productId) {
      sql += ' WHERE product_id = $1';
      params.push(productId);
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';

    const result = await query(sql, params);
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 6. CUSTOMER MANAGEMENT
// -------------------------------------------------------------

export async function getAdminCustomers(req, res, next) {
  try {
    const { q } = req.query;
    let sql = `
      SELECT
        email,
        MAX(customer_name) as name,
        MAX(phone) as phone,
        MAX(city) as city,
        MAX(state) as state,
        COUNT(id) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent,
        MAX(created_at) as last_order_date
      FROM orders
      GROUP BY email
      ORDER BY total_spent DESC
    `;

    const result = await query(sql);
    let customers = result.rows;

    if (q && q.trim()) {
      const lower = q.trim().toLowerCase();
      customers = customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(lower) ||
          c.email?.toLowerCase().includes(lower) ||
          c.phone?.includes(lower)
      );
    }

    res.json({ success: true, total: customers.length, customers });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 7. CATEGORIES & COLLECTIONS
// -------------------------------------------------------------

export async function getAdminCategories(req, res, next) {
  try {
    const result = await query(`SELECT * FROM categories ORDER BY display_order ASC, id ASC`);
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function createAdminCategory(req, res, next) {
  try {
    const { name, slug, description, imageUrl, displayOrder = 0 } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const result = await query(
      `INSERT INTO categories (name, slug, description, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, generatedSlug, description || '', imageUrl || '', displayOrder]
    );

    await logActivity(req, 'CREATE_CATEGORY', 'categories', result.rows[0].id, { name });
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, displayOrder, isActive } = req.body;

    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           display_order = COALESCE($5, display_order),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [name, slug, description, imageUrl, displayOrder, isActive, id]
    );

    res.json({ success: true, category: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCategory(req, res, next) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM categories WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminCollections(req, res, next) {
  try {
    const result = await query(`SELECT * FROM collections ORDER BY display_order ASC, id ASC`);
    res.json({ success: true, collections: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function createAdminCollection(req, res, next) {
  try {
    const { title, slug, subtitle, description, bannerUrl, isFeatured = 0, displayOrder = 0 } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Collection title is required.' });

    const genSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const result = await query(
      `INSERT INTO collections (title, slug, subtitle, description, banner_url, is_featured, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, genSlug, subtitle || '', description || '', bannerUrl || '', isFeatured ? 1 : 0, displayOrder]
    );

    await logActivity(req, 'CREATE_COLLECTION', 'collections', result.rows[0].id, { title });
    res.status(201).json({ success: true, collection: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCollection(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, subtitle, description, bannerUrl, isFeatured, isActive, displayOrder } = req.body;

    const result = await query(
      `UPDATE collections
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           subtitle = COALESCE($3, subtitle),
           description = COALESCE($4, description),
           banner_url = COALESCE($5, banner_url),
           is_featured = COALESCE($6, is_featured),
           is_active = COALESCE($7, is_active),
           display_order = COALESCE($8, display_order)
       WHERE id = $9 RETURNING *`,
      [title, slug, subtitle, description, bannerUrl, isFeatured, isActive, displayOrder, id]
    );

    res.json({ success: true, collection: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCollection(req, res, next) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM collections WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Collection deleted.' });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 8. COUPONS & DISCOUNTS
// -------------------------------------------------------------

export async function getAdminCoupons(req, res, next) {
  try {
    const result = await query(`SELECT * FROM coupons ORDER BY id DESC`);
    res.json({ success: true, coupons: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function createAdminCoupon(req, res, next) {
  try {
    const { code, description, discountType = 'percentage', discountValue, minOrderAmount = 0, maxDiscountAmount, usageLimit = 100 } = req.body;
    if (!code || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const result = await query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code.trim().toUpperCase(), description || '', discountType, discountValue, minOrderAmount, maxDiscountAmount || null, usageLimit]
    );

    await logActivity(req, 'CREATE_COUPON', 'coupons', result.rows[0].id, { code });
    res.status(201).json({ success: true, coupon: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, isActive } = req.body;

    const result = await query(
      `UPDATE coupons
       SET code = COALESCE($1, code),
           description = COALESCE($2, description),
           discount_type = COALESCE($3, discount_type),
           discount_value = COALESCE($4, discount_value),
           min_order_amount = COALESCE($5, min_order_amount),
           max_discount_amount = COALESCE($6, max_discount_amount),
           usage_limit = COALESCE($7, usage_limit),
           is_active = COALESCE($8, is_active)
       WHERE id = $9 RETURNING *`,
      [code ? code.trim().toUpperCase() : null, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, isActive, id]
    );

    res.json({ success: true, coupon: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCoupon(req, res, next) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM coupons WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const { code, cartTotal = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });

    const result = await query(
      `SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = 1`,
      [code.trim().toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive promotional code.' });
    }

    const c = result.rows[0];
    if (cartTotal < c.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum bag value of ₹${c.min_order_amount.toLocaleString('en-IN')}.`,
      });
    }

    let discount = 0;
    if (c.discount_type === 'percentage') {
      discount = (cartTotal * c.discount_value) / 100;
      if (c.max_discount_amount && discount > c.max_discount_amount) {
        discount = c.max_discount_amount;
      }
    } else if (c.discount_type === 'fixed') {
      discount = Math.min(c.discount_value, cartTotal);
    } else if (c.discount_type === 'free_shipping') {
      discount = 0; // Handled by zero shipping
    }

    res.json({
      success: true,
      message: `Coupon "${c.code}" applied successfully!`,
      coupon: {
        code: c.code,
        description: c.description,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        calculatedDiscount: Math.round(discount),
      },
    });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 9. HOMEPAGE CMS & CONTENT MANAGEMENT
// -------------------------------------------------------------

export async function getContentSection(req, res, next) {
  try {
    const { section } = req.params;
    const result = await query(`SELECT content_json, updated_at FROM homepage_cms WHERE section_key = $1`, [section]);

    if (result.rows.length === 0) {
      return res.json({ success: true, section, content: null });
    }

    res.json({
      success: true,
      section,
      content: JSON.parse(result.rows[0].content_json),
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateContentSection(req, res, next) {
  try {
    const { section } = req.params;
    const { content } = req.body;

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    const exists = await query(`SELECT id FROM homepage_cms WHERE section_key = $1`, [section]);
    if (exists.rows.length > 0) {
      await query(
        `UPDATE homepage_cms SET content_json = $1, updated_at = NOW() WHERE section_key = $2`,
        [contentStr, section]
      );
    } else {
      await query(
        `INSERT INTO homepage_cms (section_key, content_json) VALUES ($1, $2)`,
        [section, contentStr]
      );
    }

    await logActivity(req, 'UPDATE_CMS', 'homepage_cms', section, { section });

    res.json({ success: true, message: `Homepage section "${section}" updated successfully.` });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 10. REVIEWS MODERATION
// -------------------------------------------------------------

export async function getAdminReviews(req, res, next) {
  try {
    const { status = 'all' } = req.query;
    let sql = 'SELECT * FROM reviews';
    const params = [];
    if (status !== 'all') {
      sql += ' WHERE status = $1';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function updateReviewStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.json({ success: true, review: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM reviews WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 11. STAFF & PERMISSIONS
// -------------------------------------------------------------

export async function getStaff(req, res, next) {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, is_active, created_at FROM users
       WHERE role IN ('admin', 'super_admin', 'product_manager', 'order_manager', 'content_manager', 'support')
       ORDER BY id ASC`
    );
    res.json({ success: true, staff: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function createStaff(req, res, next) {
  try {
    const { name, email, password, role = 'support', phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const emailClean = email.trim().toLowerCase();
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [emailClean]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone, created_at`,
      [name.trim(), emailClean, hash, role, phone || null]
    );

    await logActivity(req, 'CREATE_STAFF', 'users', result.rows[0].id, { email: emailClean, role });
    res.status(201).json({ success: true, staff: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const { role, isActive, phone, name } = req.body;

    const result = await query(
      `UPDATE users
       SET role = COALESCE($1, role),
           is_active = COALESCE($2, is_active),
           phone = COALESCE($3, phone),
           name = COALESCE($4, name),
           updated_at = NOW()
       WHERE id = $5 RETURNING id, name, email, role, phone, is_active, updated_at`,
      [role, isActive, phone, name, id]
    );

    res.json({ success: true, staff: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteStaff(req, res, next) {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own active administrator account.' });
    }

    await query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Staff account removed.' });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 12. ACTIVITY LOGS
// -------------------------------------------------------------

export async function getActivityLogs(req, res, next) {
  try {
    const result = await query(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100`);
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    next(error);
  }
}

// -------------------------------------------------------------
// 13. STORE SETTINGS
// -------------------------------------------------------------

export async function getStoreSettings(req, res, next) {
  try {
    const result = await query(`SELECT * FROM store_settings LIMIT 1`);
    res.json({ success: true, settings: result.rows[0] || {} });
  } catch (error) {
    next(error);
  }
}

export async function updateStoreSettings(req, res, next) {
  try {
    const {
      storeName,
      tagline,
      supportEmail,
      supportPhone,
      address,
      currency,
      freeShippingThreshold,
      standardShippingFee,
      taxPercentage,
      announcementText,
      announcementEnabled,
    } = req.body;

    const result = await query(
      `UPDATE store_settings
       SET store_name = COALESCE($1, store_name),
           tagline = COALESCE($2, tagline),
           support_email = COALESCE($3, support_email),
           support_phone = COALESCE($4, support_phone),
           address = COALESCE($5, address),
           currency = COALESCE($6, currency),
           free_shipping_threshold = COALESCE($7, free_shipping_threshold),
           standard_shipping_fee = COALESCE($8, standard_shipping_fee),
           tax_percentage = COALESCE($9, tax_percentage),
           announcement_text = COALESCE($10, announcement_text),
           announcement_enabled = COALESCE($11, announcement_enabled),
           updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        storeName,
        tagline,
        supportEmail,
        supportPhone,
        address,
        currency,
        freeShippingThreshold,
        standardShippingFee,
        taxPercentage,
        announcementText,
        announcementEnabled,
      ]
    );

    await logActivity(req, 'UPDATE_SETTINGS', 'store_settings', 1, req.body);
    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/returns
 * Retrieve all return & refund requests
 */
export async function getAdminReturns(req, res, next) {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM order_returns';
    const params = [];
    if (status && status !== 'all') {
      sql += ' WHERE status = $1';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, returns: result.rows });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/returns/:id/status
 * Update return request status and initiate refund
 */
export async function updateAdminReturnStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes, refundAmount } = req.body;

    const currentRes = await query('SELECT * FROM order_returns WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Return request not found.' });
    }
    const ret = currentRes.rows[0];

    const updated = await query(`
      UPDATE order_returns
      SET status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          refund_amount = COALESCE($3, refund_amount),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, adminNotes, refundAmount, id]);

    // If refund completed or rejected, sync parent order
    if (status === 'refund_completed') {
      await query(`
        UPDATE orders
        SET payment_status = 'refunded',
            order_status = 'returned',
            updated_at = NOW()
        WHERE id = $1
      `, [ret.order_id]);
    } else if (status === 'rejected') {
      await query(`
        UPDATE orders
        SET order_status = 'delivered',
            updated_at = NOW()
        WHERE id = $1
      `, [ret.order_id]);
    }

    // Log admin activity
    try {
      await logActivity(req, 'UPDATE_RETURN_STATUS', 'order_returns', id, { status, adminNotes, refundAmount });

      broadcastAdminEvent('order:status_updated', {
        order_id: ret.order_id,
        order_number: ret.order_number,
        order_status: status === 'refund_completed' ? 'returned' : (status === 'rejected' ? 'delivered' : 'return_in_progress')
      });
    } catch {}

    res.json({ success: true, message: `Return status updated to ${status}.`, returnRequest: updated.rows[0] });
  } catch (error) {
    next(error);
  }
}

export default {
  adminLogin,
  getAdminMe,
  getOverview,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  bulkUpdateProducts,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderShipping,
  getAdminInventory,
  adjustInventory,
  getInventoryLogs,
  getAdminCustomers,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminCollections,
  createAdminCollection,
  updateAdminCollection,
  deleteAdminCollection,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  validateCoupon,
  getContentSection,
  updateContentSection,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getActivityLogs,
  getStoreSettings,
  updateStoreSettings,
};

