import { pool, query } from '../config/db.js';

/**
 * GET /api/reviews/:productId
 * Get reviews for a specific saree product
 */
export async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;

    const result = await query(
      `SELECT r.id, r.product_id, r.author_name, r.rating, r.comment, r.created_at
       FROM reviews r
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json({
      success: true,
      reviews: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reviews
 * Add a verified customer review and recalculate product rating average
 */
export async function addReview(req, res, next) {
  const client = await pool.connect();
  try {
    const { productId, authorName, rating, comment } = req.body;

    if (!productId || !authorName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, author name, rating (1-5), and review comment are required.',
      });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.',
      });
    }

    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO reviews (product_id, user_id, author_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [productId, req.user ? req.user.id : null, authorName.trim(), numRating, comment.trim()]
    );

    // Recalculate average rating and reviews count for the product
    const statsResult = await client.query(
      `SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating
       FROM reviews
       WHERE product_id = $1`,
      [productId]
    );

    const totalReviews = parseInt(statsResult.rows[0].total_reviews, 10);
    const avgRating = parseFloat(statsResult.rows[0].avg_rating).toFixed(2);

    await client.query(
      `UPDATE products
       SET rating = $1, reviews_count = $2, updated_at = NOW()
       WHERE id = $3`,
      [avgRating, totalReviews, productId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully. Thank you for your review.',
      review: insertResult.rows[0],
      newRating: avgRating,
      reviewsCount: totalReviews,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}
