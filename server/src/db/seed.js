import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/db.js';

const INITIAL_CATEGORIES = [
  {
    name: 'Kanjivaram Silk',
    slug: 'kanjivaram-silk',
    description: 'Ancient weave of royalty, pure mulberry silk handwoven with authentic gold zari.',
    imageUrl: '/images/categories/kanjivaram.jpg',
  },
  {
    name: 'Kalamkari Heritage',
    slug: 'kalamkari',
    description: 'Hand-painted mythological art on silk using natural vegetable dyes and tamarind pens.',
    imageUrl: '/images/categories/kalamkari.jpg',
  },
  {
    name: 'Tussar Wild Silk',
    slug: 'tussar-silk',
    description: 'Earthy textured wild silk celebrated for its breathable golden luster.',
    imageUrl: '/images/categories/tussar.jpg',
  },
  {
    name: 'Hand-Block Cotton',
    slug: 'hand-block-cotton',
    description: 'Breezy artisanal cotton printed by generational block carvers with natural indigo.',
    imageUrl: '/images/categories/cotton.jpg',
  },
  {
    name: 'Organza Weaves',
    slug: 'organza',
    description: 'Feather-light sheer organza drapes adorned with contemporary rose gold motifs.',
    imageUrl: '/images/categories/organza.jpg',
  },
  {
    name: 'Chanderi Heritage',
    slug: 'chanderi',
    description: 'Royal translucent drape intertwining pure silk and high-twist cotton with gold bootis.',
    imageUrl: '/images/categories/chanderi.jpg',
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Ivory Zari Kanjivaram',
    slug: 'ivory-zari-kanjivaram',
    description: 'A timeless heirloom handcrafted in Kanchipuram with pure mulberry silk in royal ivory, featuring intricately woven antique gold zari border and rich pallu.',
    price: 2899,
    originalPrice: 3499,
    fabric: 'Kanjivaram Silk',
    toneA: 'cream',
    toneB: 'silk',
    imageUrl: 'hero-model-1.png',
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.95,
    reviewsCount: 38,
  },
  {
    id: 2,
    name: 'Madder Red Kalamkari',
    slug: 'madder-red-kalamkari',
    description: 'Hand-drawn with a bamboo pen (kalam) using organic madder root dyes. Showcases intricate floral vines and sacred peacocks on handloom silk.',
    price: 2199,
    originalPrice: 2699,
    fabric: 'Kalamkari Heritage',
    toneA: 'kala',
    toneB: 't1',
    imageUrl: 'hero-model-2.png',
    stock: 8,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.88,
    reviewsCount: 24,
  },
  {
    id: 3,
    name: 'Crimson Tussar Silk',
    slug: 'crimson-tussar-silk',
    description: 'Lustrous crimson wild tussar silk with an earthy rich texture, highlighted with delicate antique gold tissue borders and woven pallu.',
    price: 3499,
    originalPrice: 4200,
    fabric: 'Tussar Wild Silk',
    toneA: 't2',
    toneB: 'cream',
    imageUrl: 'hero-model-3.png',
    stock: 10,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.92,
    reviewsCount: 19,
  },
  {
    id: 4,
    name: 'Indigo Hand-Block Cotton',
    slug: 'indigo-hand-block-cotton',
    description: 'Crisp, feather-light mulmul cotton hand-stamped with carved teak blocks and steeped in fermented natural indigo vats.',
    price: 1599,
    originalPrice: 1999,
    fabric: 'Hand-Block Cotton',
    toneA: 'cot',
    toneB: 't3',
    imageUrl: 'hero-model-4.png',
    stock: 25,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.79,
    reviewsCount: 42,
  },
  {
    id: 5,
    name: 'Rose Gold Organza',
    slug: 'rose-gold-organza',
    description: 'Gossamer-light sheer organza bathed in delicate dusty rose hues, finished with glistening scalloped rose gold cutwork borders.',
    price: 2599,
    originalPrice: 3100,
    fabric: 'Organza Weaves',
    toneA: 'silk',
    toneB: 'women',
    imageUrl: 'hero-model-5.png',
    stock: 14,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.85,
    reviewsCount: 16,
  },
  {
    id: 6,
    name: 'Peacock Kalamkari Silk',
    slug: 'peacock-kalamkari-silk',
    description: 'Master artisan work from Sri Kalahasti depicting stylized dancing peacocks and blooming lotuses, framed with contrast royal purple piping.',
    price: 3199,
    originalPrice: 3799,
    fabric: 'Kalamkari Heritage',
    toneA: 't3',
    toneB: 'kala',
    imageUrl: 'hero-model-6.png',
    stock: 7,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.97,
    reviewsCount: 31,
  },
  {
    id: 7,
    name: 'Sandal Chanderi',
    slug: 'sandal-chanderi',
    description: 'Chanderi silk-cotton blend infused with soothing sandalwood hues, adorned with miniature gold ashrafi bootis across the body.',
    price: 1899,
    originalPrice: 2299,
    fabric: 'Chanderi Heritage',
    toneA: 'women',
    toneB: 'win',
    imageUrl: 'hero-model-7.png',
    stock: 15,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.81,
    reviewsCount: 12,
  },
  {
    id: 8,
    name: 'Maroon Temple Border',
    slug: 'maroon-temple-border',
    description: 'Grand royal bridal Kanjivaram in deep vermilion maroon, woven with interlocking korvai temple spires and traditional chakram motifs.',
    price: 3899,
    originalPrice: 4599,
    fabric: 'Kanjivaram Silk',
    toneA: 't1',
    toneB: 'hero',
    imageUrl: 'hero-model-8.png',
    stock: 9,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.99,
    reviewsCount: 54,
  },
];

export async function seedDatabase() {
  console.log('--- Seeding Vaagai PostgreSQL Database ---');

  const connection = await testConnection();
  if (!connection.ok) {
    throw new Error(connection.message);
  }

  // 1. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url`,
      [cat.name, cat.slug, cat.description, cat.imageUrl]
    );
  }
  console.log(`✓ Seeded ${INITIAL_CATEGORIES.length} categories.`);

  // 2. Seed Products
  for (const p of INITIAL_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (
        id, name, slug, description, price, original_price, fabric, tone_a, tone_b, image_url,
        stock, is_featured, is_new_arrival, is_best_seller, rating, reviews_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          fabric = EXCLUDED.fabric,
          tone_a = EXCLUDED.tone_a,
          tone_b = EXCLUDED.tone_b,
          image_url = EXCLUDED.image_url,
          stock = EXCLUDED.stock,
          is_featured = EXCLUDED.is_featured,
          is_new_arrival = EXCLUDED.is_new_arrival,
          is_best_seller = EXCLUDED.is_best_seller,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count`,
      [
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.originalPrice,
        p.fabric,
        p.toneA,
        p.toneB,
        p.imageUrl,
        p.stock,
        p.isFeatured,
        p.isNewArrival,
        p.isBestSeller,
        p.rating,
        p.reviewsCount,
      ]
    );
  }
  // Reset sequence for products table so new inserts get correct next IDs
  await pool.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);
  console.log(`✓ Seeded ${INITIAL_PRODUCTS.length} authentic sarees.`);

  // 3. Seed Admin and Customer Accounts
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vaagai.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Vaagai2026!';
  const adminName = process.env.ADMIN_NAME || 'Vaagai Curator';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [adminName, adminEmail, adminHash]
  );
  console.log(`✓ Seeded Admin User: ${adminEmail} (password: ${adminPassword})`);

  const demoCustomerEmail = 'customer@example.com';
  const demoCustomerHash = await bcrypt.hash('Customer123!', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Meenakshi Sundaram', $1, $2, 'customer')
     ON CONFLICT (email) DO NOTHING`,
    [demoCustomerEmail, demoCustomerHash]
  );
  console.log(`✓ Seeded Demo Customer: ${demoCustomerEmail}`);

  // 4. Seed Sample Reviews
  await pool.query(
    `INSERT INTO reviews (product_id, author_name, rating, comment)
     VALUES
       (1, 'Ananya Ramanathan', 5, 'The zari shine is regal without being loud. Drapes like a dream for my sister wedding.'),
       (1, 'Priya S.', 5, 'Authentic Kanjivaram silk. The packaging and gold seal felt like opening a royal gift.'),
       (2, 'Lakshmi Venkatesh', 5, 'The Kalamkari detailing with natural dyes has such an organic, earthy fragrance. Truly artisanal.'),
       (8, 'Divya Chandran', 5, 'Heirloom quality temple border. Received endless compliments at the reception.')
     ON CONFLICT DO NOTHING`
  );
  console.log(`✓ Seeded verified customer reviews.`);

  console.log('✅ Database seeding finished successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err.message);
      process.exit(1);
    });
}
