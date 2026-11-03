import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vaagai_super_secret_jwt_key_2026_artisanal_sarees_heritage';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 * Register a new customer
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const emailClean = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [emailClean]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'customer', $4)
       RETURNING id, name, email, role, phone, created_at`,
      [name.trim(), emailClean, passwordHash, phone || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Vaagai.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Log in an existing user / admin
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const emailClean = email.trim().toLowerCase();

    const result = await query(
      `SELECT id, name, email, password_hash, role, phone, created_at
       FROM users WHERE email = $1`,
      [emailClean]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Clean user object before sending
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
    };

    const token = generateToken(sanitizedUser);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieve current logged in user details
 */
export async function getMe(req, res, next) {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 * Update user details
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, role, phone, updated_at`,
      [name, phone, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/change-password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/addresses
 */
export async function getCustomerAddresses(req, res, next) {
  try {
    const addresses = await query(
      'SELECT * FROM customer_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, addresses: addresses.rows });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/addresses
 */
export async function addCustomerAddress(req, res, next) {
  try {
    const { name, phone, streetAddress, city, state, postalCode, country = 'India', addressType = 'Home', isDefault = 0 } = req.body;
    if (!name || !phone || !streetAddress || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'All address fields are required.' });
    }

    if (isDefault) {
      await query('UPDATE customer_addresses SET is_default = 0 WHERE user_id = $1', [req.user.id]);
    }

    const ins = await query(`
      INSERT INTO customer_addresses (user_id, name, phone, street_address, city, state, postal_code, country, address_type, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [req.user.id, name.trim(), phone.trim(), streetAddress.trim(), city.trim(), state.trim(), postalCode.trim(), country, addressType, isDefault ? 1 : 0]);

    res.status(201).json({ success: true, message: 'Address saved.', address: ins.rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/auth/addresses/:id
 */
export async function deleteCustomerAddress(req, res, next) {
  try {
    const { id } = req.params;
    await query('DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true, message: 'Address removed.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/wishlist
 */
export async function getCustomerWishlist(req, res, next) {
  try {
    const items = await query(`
      SELECT w.id as wishlist_id, w.created_at as added_at, p.*
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, items: items.rows });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/wishlist
 */
export async function addToCustomerWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    await query(`
      INSERT INTO wishlist_items (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT(user_id, product_id) DO NOTHING
    `, [req.user.id, productId]);

    res.json({ success: true, message: 'Added to wishlist.' });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/auth/wishlist/:productId
 */
export async function removeFromCustomerWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
}
