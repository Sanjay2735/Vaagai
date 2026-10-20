import { query } from '../config/db.js';

/**
 * POST /api/contact
 * Submit a customer inquiry / bespoke styling consultation request
 */
export async function submitInquiry(req, res, next) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and inquiry message are required.',
      });
    }

    const result = await query(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'unread')
       RETURNING id, name, email, subject, created_at`,
      [name.trim(), email.trim().toLowerCase(), phone || null, subject || 'General Inquiry', message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Your bespoke inquiry has been received. Our concierge will be in touch shortly.',
      inquiry: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/contact/inquiries (Admin only)
 * Retrieve customer inquiries
 */
export async function getInquiries(req, res, next) {
  try {
    const result = await query(
      'SELECT * FROM contact_inquiries ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      inquiries: result.rows,
    });
  } catch (error) {
    next(error);
  }
}
