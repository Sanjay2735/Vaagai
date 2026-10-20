import { query } from '../config/db.js';

/**
 * Normalizes a product database row to ensure seamless compatibility with
 * both rich REST clients and the existing Vaagai frontend (n, p, a, b, image).
 */
function formatProduct(p) {
  return {
    id: p.id,
    n: p.name,
    p: Number(p.price),
    a: p.tone_a,
    b: p.tone_b,
    image: p.image_url,
    // Extended properties
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    fabric: p.fabric,
    toneA: p.tone_a,
    toneB: p.tone_b,
    imageUrl: p.image_url,
    stock: p.stock,
    isFeatured: p.is_featured,
    isNewArrival: p.is_new_arrival,
    isBestSeller: p.is_best_seller,
    rating: Number(p.rating),
    reviewsCount: p.reviews_count,
    createdAt: p.created_at,
  };
}

/**
 * GET /api/products
 * Query products with search, filtering, sorting, and pagination
 */
export async function getProducts(req, res, next) {
  try {
    const {
      q,
      fabric,
      tone,
      featured,
      bestSeller,
      newArrival,
      sort,
      page = 1,
      limit = 50,
    } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Search query across name, description, fabric
    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      conditions.push(
        `(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR fabric ILIKE $${paramIndex})`
      );
      params.push(searchTerm);
      paramIndex++;
    }

    // Fabric filter
    if (fabric) {
      conditions.push(`fabric ILIKE $${paramIndex}`);
      params.push(`%${fabric}%`);
      paramIndex++;
    }

    // Tone filter (tone_a or tone_b)
    if (tone) {
      conditions.push(`(tone_a = $${paramIndex} OR tone_b = $${paramIndex})`);
      params.push(tone);
      paramIndex++;
    }

    // Featured filter
    if (featured !== undefined) {
      conditions.push(`is_featured = $${paramIndex}`);
      params.push(featured === 'true' || featured === true);
      paramIndex++;
    }

    // Best Seller filter
    if (bestSeller !== undefined) {
      conditions.push(`is_best_seller = $${paramIndex}`);
      params.push(bestSeller === 'true' || bestSeller === true);
      paramIndex++;
    }

    // New Arrival filter
    if (newArrival !== undefined) {
      conditions.push(`is_new_arrival = $${paramIndex}`);
      params.push(newArrival === 'true' || newArrival === true);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting logic
    let orderBy = 'ORDER BY id ASC';
    if (sort === 'price_asc') {
      orderBy = 'ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'ORDER BY price DESC';
    } else if (sort === 'rating') {
      orderBy = 'ORDER BY rating DESC';
    } else if (sort === 'newest') {
      orderBy = 'ORDER BY created_at DESC';
    }

    // Count total matches
    const countSql = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const dataSql = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const dataResult = await query(dataSql, params);
    const products = dataResult.rows.map(formatProduct);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:idOrSlug
 * Retrieve single product by numeric ID or URL slug
 */
export async function getProductByIdOrSlug(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const sql = isNumeric
      ? 'SELECT * FROM products WHERE id = $1'
      : 'SELECT * FROM products WHERE slug = $1';

    const result = await query(sql, [idOrSlug]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const product = formatProduct(result.rows[0]);

    // Fetch associated reviews
    const reviewsResult = await query(
      'SELECT id, author_name, rating, comment, created_at FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [product.id]
    );

    res.json({
      success: true,
      product: {
        ...product,
        reviews: reviewsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/categories
 * Retrieve all saree categories
 */
export async function getCategories(req, res, next) {
  try {
    const result = await query('SELECT * FROM categories ORDER BY id ASC');
    res.json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products (Admin only)
 * Create a new saree product
 */
export async function createProduct(req, res, next) {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      fabric,
      toneA,
      toneB,
      imageUrl,
      stock = 10,
      isFeatured = false,
      isNewArrival = true,
      isBestSeller = false,
    } = req.body;

    if (!name || !price || !fabric) {
      return res.status(400).json({
        success: false,
        message: 'Product name, price, and fabric are required fields.',
      });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const result = await query(
      `INSERT INTO products (
        name, slug, description, price, original_price, fabric, tone_a, tone_b, image_url,
        stock, is_featured, is_new_arrival, is_best_seller
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        name,
        generatedSlug,
        description || '',
        price,
        originalPrice || null,
        fabric,
        toneA || 'cream',
        toneB || 'silk',
        imageUrl || '',
        stock,
        Boolean(isFeatured),
        Boolean(isNewArrival),
        Boolean(isBestSeller),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: formatProduct(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id (Admin only)
 * Update an existing saree product
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      originalPrice,
      fabric,
      toneA,
      toneB,
      imageUrl,
      stock,
      isFeatured,
      isNewArrival,
      isBestSeller,
    } = req.body;

    const result = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           original_price = COALESCE($4, original_price),
           fabric = COALESCE($5, fabric),
           tone_a = COALESCE($6, tone_a),
           tone_b = COALESCE($7, tone_b),
           image_url = COALESCE($8, image_url),
           stock = COALESCE($9, stock),
           is_featured = COALESCE($10, is_featured),
           is_new_arrival = COALESCE($11, is_new_arrival),
           is_best_seller = COALESCE($12, is_best_seller),
           updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        name,
        description,
        price,
        originalPrice,
        fabric,
        toneA,
        toneB,
        imageUrl,
        stock,
        isFeatured,
        isNewArrival,
        isBestSeller,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: formatProduct(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id (Admin only)
 * Delete a product
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id, name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.json({
      success: true,
      message: `Product "${result.rows[0].name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
