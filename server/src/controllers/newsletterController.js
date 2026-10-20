import { query } from '../config/db.js';

/**
 * POST /api/newsletter/subscribe
 * Add an email to royal newsletters & private showcase alerts
 */
export async function subscribe(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    await query(
      `INSERT INTO newsletter_subscribers (email, is_active)
       VALUES ($1, true)
       ON CONFLICT (email) DO UPDATE SET is_active = true`,
      [cleanEmail]
    );

    res.json({
      success: true,
      message: 'You have been enrolled in the Vaagai private salon and showcase dispatches.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/newsletter/subscribers (Admin only)
 * List all active newsletter subscribers
 */
export async function getSubscribers(req, res, next) {
  try {
    const result = await query(
      'SELECT id, email, is_active, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );
    res.json({
      success: true,
      subscribers: result.rows,
    });
  } catch (error) {
    next(error);
  }
}
