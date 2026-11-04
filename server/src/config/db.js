import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
let Database = null;
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const { Pool } = pg;
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

let pool = null;
let sqliteDb = null;
let isSqliteMode = false;
let dbInitialized = false;

// Dynamically load SQLite only when not in serverless (e.g. Vercel)
const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
if (!isVercel) {
  try {
    const mod = await import('better-sqlite3');
    Database = mod.default;
  } catch {}
}

const dataDir = path.resolve(__dirname, '../../data');
if (!isVercel && !fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {}
}
const sqlitePath = path.join(dataDir, 'vaagai.db');

// Try configuring PG pool
const poolConfig = {};
if (hasDatabaseUrl) {
  const dbUrl = process.env.DATABASE_URL.trim();
  poolConfig.connectionString = dbUrl;
  const isCloudHost =
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('supabase.co') ||
    dbUrl.includes('supabase.com') ||
    dbUrl.includes('pooler.supabase.com') ||
    dbUrl.includes('render.com') ||
    process.env.PGSSL === 'true';

  if (isCloudHost) {
    poolConfig.ssl = { rejectUnauthorized: false };
    poolConfig.family = 4;
  }
} else {
  poolConfig.host = process.env.PGHOST || 'localhost';
  poolConfig.port = Number(process.env.PGPORT) || 5432;
  poolConfig.user = process.env.PGUSER || 'postgres';
  poolConfig.password = process.env.PGPASSWORD || 'postgres';
  poolConfig.database = process.env.PGDATABASE || 'vaagai_db';
}
poolConfig.family = 4;
poolConfig.connectionTimeoutMillis = 10000;

pool = new Pool(poolConfig);
pool.on('error', () => {
  // Suppress uncaught pool error crashes; will fallback to SQLite
});

// Pool mock wrapper for SQLite & Postgres
const origConnect = pool.connect.bind(pool);
pool.connect = function(cb) {
  if (typeof cb === 'function') {
    if (isSqliteMode) {
      const mockClient = {
        query: (sql, params, qCb) => {
          if (typeof qCb === 'function') {
            query(sql, params).then(r => qCb(null, r)).catch(qCb);
          } else {
            return query(sql, params);
          }
        },
        release: () => {},
      };
      return cb(null, mockClient, () => {});
    }
    return origConnect(cb);
  }

  // Promise-based connect
  if (isSqliteMode) {
    return Promise.resolve({
      query: (sql, params) => query(sql, params),
      release: () => {},
    });
  }
  return origConnect().catch(async () => {
    isSqliteMode = true;
    await initializeDatabase();
    return {
      query: (sql, params) => query(sql, params),
      release: () => {},
    };
  });
};

function getSqlite() {
  if (!Database) {
    throw new Error('SQLite engine is not available. Please ensure DATABASE_URL is configured for PostgreSQL.');
  }
  if (!sqliteDb) {
    sqliteDb = new Database(sqlitePath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

/**
 * Converts a PostgreSQL-style parameterized SQL query ($1, $2...) to SQLite (?, ?...)
 * and adapts functions like NOW(), ILIKE, SERIAL, etc.
 */
function adaptSqlForSqlite(sql) {
  let adapted = sql
    .replace(/ILIKE/gi, 'LIKE')
    .replace(/NOW\(\)/gi, "datetime('now', 'localtime')")
    .replace(/FOR UPDATE/gi, '')
    .replace(/\$(\d+)/g, '?');

  return adapted;
}

/**
 * Initializes database tables and default seed data if needed
 */
export async function initializeDatabase() {
  if (dbInitialized) return;
  dbInitialized = true;

  if (isSqliteMode) {
    const sdb = getSqlite();

    sdb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        phone TEXT,
        avatar_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        subtitle TEXT,
        description TEXT,
        banner_url TEXT,
        is_featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        sku TEXT UNIQUE,
        description TEXT,
        price REAL NOT NULL DEFAULT 0,
        original_price REAL,
        cost_price REAL,
        fabric TEXT NOT NULL,
        weave TEXT DEFAULT 'Handloom',
        zari_type TEXT DEFAULT 'Pure Gold Zari',
        border_style TEXT DEFAULT 'Traditional Temple Border',
        blouse_details TEXT DEFAULT 'Includes 0.8m running blouse piece',
        length TEXT DEFAULT '5.5m + 0.8m Blouse',
        origin TEXT DEFAULT 'Kanchipuram, Tamil Nadu',
        care_instructions TEXT DEFAULT 'Strictly Dry Clean Only',
        tone_a TEXT DEFAULT 'Crimson',
        tone_b TEXT DEFAULT 'Antique Gold',
        image_url TEXT,
        gallery_images TEXT DEFAULT '[]',
        stock INTEGER NOT NULL DEFAULT 10,
        low_stock_threshold INTEGER DEFAULT 5,
        status TEXT DEFAULT 'active',
        is_featured INTEGER DEFAULT 0,
        is_new_arrival INTEGER DEFAULT 1,
        is_best_seller INTEGER DEFAULT 0,
        rating REAL DEFAULT 4.90,
        reviews_count INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        tags TEXT DEFAULT 'saree,handloom,luxury,silk',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT DEFAULT 'India',
        subtotal REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        coupon_code TEXT,
        shipping_fee REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'cod',
        payment_status TEXT DEFAULT 'pending',
        order_status TEXT DEFAULT 'placed',
        shipping_carrier TEXT,
        tracking_number TEXT,
        tracking_url TEXT,
        notes TEXT,
        timeline TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        sku TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        change_amount INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        reason TEXT DEFAULT 'manual_adjustment',
        admin_user TEXT DEFAULT 'System',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        discount_type TEXT DEFAULT 'percentage',
        discount_value REAL NOT NULL,
        min_order_amount REAL DEFAULT 0,
        max_discount_amount REAL,
        usage_limit INTEGER DEFAULT 100,
        times_used INTEGER DEFAULT 0,
        start_date TEXT,
        expires_at TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        product_name TEXT,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        author_email TEXT,
        rating INTEGER NOT NULL,
        title TEXT,
        comment TEXT NOT NULL,
        status TEXT DEFAULT 'approved',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS homepage_cms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_key TEXT UNIQUE NOT NULL,
        content_json TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_name TEXT,
        user_email TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS store_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT DEFAULT 'VAAGAI Luxury Sarees',
        tagline TEXT DEFAULT 'Artisanal South Indian Saree Atelier',
        support_email TEXT DEFAULT 'concierge@vaagai.com',
        support_phone TEXT DEFAULT '+91 98400 12345',
        address TEXT DEFAULT '104 Cathedral Road, Gopalapuram, Chennai, Tamil Nadu 600086',
        currency TEXT DEFAULT 'INR',
        free_shipping_threshold REAL DEFAULT 5000,
        standard_shipping_fee REAL DEFAULT 0,
        tax_percentage REAL DEFAULT 5.0,
        announcement_text TEXT DEFAULT 'Complimentary Pan-India Express Delivery & Bespoke Blouse Tailoring on all Orders.',
        announcement_enabled INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        is_active INTEGER DEFAULT 1,
        subscribed_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS customer_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        street_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT DEFAULT 'India',
        address_type TEXT DEFAULT 'Home',
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        UNIQUE(user_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS order_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        order_number TEXT NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        photo_url TEXT,
        status TEXT DEFAULT 'requested',
        refund_amount REAL NOT NULL,
        admin_notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Seed Super Admin if not present
    const existingAdmin = sdb.prepare("SELECT id FROM users WHERE email = ?").get('admin@vaagai.com');
    if (!existingAdmin) {
      const hash = bcrypt.hashSync('Admin@Vaagai2026!', 10);
      sdb.prepare(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES (?, ?, ?, 'super_admin', '+91 98400 12345')
      `).run('Vaagai Super Admin', 'admin@vaagai.com', hash);

      // Seed Product Manager
      sdb.prepare(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES (?, ?, ?, 'product_manager', '+91 98400 23456')
      `).run('Meenakshi Sundaram (Curator)', 'curator@vaagai.com', bcrypt.hashSync('Curator@2026', 10));

      // Seed Order Manager
      sdb.prepare(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES (?, ?, ?, 'order_manager', '+91 98400 34567')
      `).run('Karthik Raman (Fulfillment)', 'orders@vaagai.com', bcrypt.hashSync('Orders@2026', 10));

      console.log('✅ Default Admin & Staff Accounts seeded in SQLite.');
    }

    // Seed default Categories
    const countCategories = sdb.prepare("SELECT COUNT(*) as count FROM categories").get().count;
    if (countCategories === 0) {
      const categories = [
        { name: 'Kanjivaram Silk', slug: 'kanjivaram', desc: 'Regal pure mulberry silk woven with gold zari from Kanchipuram.', img: '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg' },
        { name: 'Banarasi Brocade', slug: 'banarasi', desc: 'Intricate Mughal and floral motifs woven in pure Varanasi silk.', img: '/src/assests/images/catalog/bottle_green_banarasi_1792474427242.jpg' },
        { name: 'Chanderi & Organza', slug: 'organza', desc: 'Sheer lightweight weaves adorned with delicate metallic borders.', img: '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg' },
        { name: 'Tussar Heritage', slug: 'tussar', desc: 'Raw textured wild silk sarees with artisanal hand-block and Kalamkari prints.', img: '/src/assests/images/catalog/navy_tussar_saree_1792474503287.jpg' },
        { name: 'Royal Kalakaari', slug: 'kalakaari', desc: 'Masterpiece hand-painted pen Kalamkari on vintage South Indian silks.', img: '/src/assests/images/catalog/royal_purple_saree_1792474526549.jpg' },
        { name: 'Handloom Cotton', slug: 'cotton', desc: 'Breathable Chettinad and Mangalagiri cottons for festive understated grace.', img: '/src/assests/images/catalog/handloom_cotton_saree_1792474579643.jpg' }
      ];

      const stmt = sdb.prepare(`INSERT INTO categories (name, slug, description, image_url, display_order) VALUES (?, ?, ?, ?, ?)`);
      categories.forEach((cat, idx) => stmt.run(cat.name, cat.slug, cat.desc, cat.img, idx + 1));
      console.log('✅ Categories seeded.');
    }

    // Seed Collections
    const countCollections = sdb.prepare("SELECT COUNT(*) as count FROM collections").get().count;
    if (countCollections === 0) {
      const collections = [
        { title: 'The Royal Bridal Sanctuary', slug: 'bridal-sanctuary', subtitle: 'Heirloom Kanjivaram Weaves', desc: 'Exquisite heavy-weight Kanjivarams with 3-ply silk and real gold zari for temple weddings.', banner: '/src/assests/images/banner/banner-1.png', featured: 1 },
        { title: 'Kalaakaari Handloom Atelier', slug: 'kalakaari-atelier', subtitle: 'Handpainted Sri Kalahasti Art', desc: 'Each drape represents 45 days of organic vegetable dye sketching by master artisans.', banner: '/src/assests/images/banner/banner-2.png', featured: 1 },
        { title: 'Summer Gossamer Weaves', slug: 'summer-gossamer', subtitle: 'Featherlight Organza & Chanderi', desc: 'Ethereal pastel tones designed for sunlit morning rituals and intimate soirees.', banner: '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg', featured: 0 },
        { title: 'Temple Border Heritage', slug: 'temple-borders', subtitle: 'Classic Korvai Interlock Borders', desc: 'Timeless contrasting borders woven using ancient Korvai shuttle techniques.', banner: '/src/assests/images/catalog/ivory_gold_saree_1792474405497.jpg', featured: 1 }
      ];

      const stmt = sdb.prepare(`INSERT INTO collections (title, slug, subtitle, description, banner_url, is_featured, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      collections.forEach((c, idx) => stmt.run(c.title, c.slug, c.subtitle, c.desc, c.banner, c.featured, idx + 1));
      console.log('✅ Collections seeded.');
    }

    // Seed Products
    const countProducts = sdb.prepare("SELECT COUNT(*) as count FROM products").get().count;
    if (countProducts === 0) {
      const products = [
        {
          name: 'The Crimson Mayil Kanjivaram',
          slug: 'crimson-mayil-kanjivaram',
          sku: 'VAG-KAN-001',
          desc: 'Woven in the ancient temple town of Kanchipuram, this masterpiece features 3-ply pure mulberry silk drenched in deep crimson with antique peacock (Mayil) chakram zari motifs along the border.',
          price: 48500,
          origPrice: 56000,
          costPrice: 28000,
          fabric: 'Kanjivaram Silk',
          weave: 'Korvai Handloom',
          zari: 'Pure 2G Gold Zari',
          border: 'Korvai Temple Mayil Border',
          blouse: 'Includes 0.85m Contrast Emerald Silk Blouse',
          length: '5.5m + 0.85m Blouse (48 in width)',
          origin: 'Kanchipuram, Tamil Nadu',
          toneA: '#720F25',
          toneB: '#C9A43B',
          img: '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg',
          stock: 8,
          featured: 1,
          newArrival: 1,
          bestSeller: 1,
          rating: 4.96,
          reviews: 24
        },
        {
          name: 'Ivory Aab-e-Zar Swarnachari Saree',
          slug: 'ivory-aab-e-zar-swarnachari',
          sku: 'VAG-BAN-002',
          desc: 'A celestial symphony of warm ivory tissue silk enriched with delicate Swarna zari floral jaal. Inspired by ancient Tanjore court attire, designed for morning muhurthams.',
          price: 36200,
          origPrice: 42000,
          costPrice: 21000,
          fabric: 'Banarasi Katan Silk',
          weave: 'Kadwa Handloom',
          zari: 'Tested Swarna Antique Zari',
          border: 'Delicate Floral Ganga-Jamuna Border',
          blouse: 'Includes 0.8m Tone-on-tone Ivory Raw Silk Blouse',
          length: '5.5m + 0.8m Blouse',
          origin: 'Varanasi, Uttar Pradesh',
          toneA: '#F5EEE5',
          toneB: '#C9A43B',
          img: '/src/assests/images/catalog/ivory_gold_saree_1792474405497.jpg',
          stock: 6,
          featured: 1,
          newArrival: 0,
          bestSeller: 1,
          rating: 4.92,
          reviews: 18
        },
        {
          name: 'Forest Emerald Shikarghar Brocade',
          slug: 'forest-emerald-shikarghar-brocade',
          sku: 'VAG-BAN-003',
          desc: 'Sumptuous deep bottle green Banarasi silk featuring the revered Shikarghar motifs: royal elephants, deer, and floral vines, hand-woven with antique brushed gold zari.',
          price: 42000,
          origPrice: 49000,
          costPrice: 24500,
          fabric: 'Banarasi Brocade',
          weave: 'Shikarghar Jamdani Weave',
          zari: 'Antique Brushed Gold Zari',
          border: 'Heavy Royal Hunting Jaal Border',
          blouse: 'Includes 0.8m Running Bottle Green Silk Blouse',
          length: '5.5m + 0.8m Blouse',
          origin: 'Varanasi, Uttar Pradesh',
          toneA: '#1A4329',
          toneB: '#C9A43B',
          img: '/src/assests/images/catalog/bottle_green_banarasi_1792474427242.jpg',
          stock: 4,
          featured: 1,
          newArrival: 1,
          bestSeller: 0,
          rating: 4.88,
          reviews: 15
        },
        {
          name: 'Haldi Mustard Vaddanam Kanjivaram',
          slug: 'haldi-mustard-vaddanam-kanjivaram',
          sku: 'VAG-KAN-004',
          desc: 'Radiant festive turmeric mustard silk with a contrasting vermillion red pallu adorned with intricate annapakshi and rudraksha border detailing.',
          price: 39500,
          origPrice: 45000,
          costPrice: 22000,
          fabric: 'Kanjivaram Silk',
          weave: 'Korvai Double Warp',
          zari: 'Pure Gold Zari',
          border: 'Contrast Vermillion Temple Border',
          blouse: 'Includes 0.8m Vermillion Red Silk Blouse with Zari Sleeves',
          length: '5.5m + 0.8m Blouse',
          origin: 'Kanchipuram, Tamil Nadu',
          toneA: '#D99B26',
          toneB: '#720F25',
          img: '/src/assests/images/catalog/mustard_festive_saree_1792474451533.jpg',
          stock: 12,
          featured: 1,
          newArrival: 0,
          bestSeller: 1,
          rating: 4.95,
          reviews: 32
        },
        {
          name: 'Gulabi Rose Petal Sheer Organza',
          slug: 'gulabi-rose-petal-sheer-organza',
          sku: 'VAG-ORG-005',
          desc: 'Weightless hand-spun organza drape in delicate blush pink, elevated by fine hand-embroidered cutwork and micro-sequin scalloped edges.',
          price: 24800,
          origPrice: 29000,
          costPrice: 14000,
          fabric: 'Pure Kora Organza',
          weave: 'Fine Plain Weave with Hand Embroidery',
          zari: 'Matte Rose Gold Metallic Thread',
          border: 'Hand-scalloped Zardozi Border',
          blouse: 'Includes 0.8m Embellished Raw Silk Blouse Piece',
          length: '5.5m + 0.8m Blouse',
          origin: 'Chanderi, Madhya Pradesh',
          toneA: '#E8B4B8',
          toneB: '#E9D9BF',
          img: '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg',
          stock: 15,
          featured: 0,
          newArrival: 1,
          bestSeller: 0,
          rating: 4.85,
          reviews: 9
        },
        {
          name: 'Midnight Neelambari Tussar Saree',
          slug: 'midnight-neelambari-tussar',
          sku: 'VAG-TUS-006',
          desc: 'Rich textured wild tussar silk in deep midnight navy with heritage hand-block printed tribal motifs and antique brass zari selvedge.',
          price: 28900,
          origPrice: 34000,
          costPrice: 16000,
          fabric: 'Raw Tussar Silk',
          weave: 'Artisanal Handloom Slub Weave',
          zari: 'Antique Muted Copper Zari',
          border: 'Block-Printed Geometric Border',
          blouse: 'Includes 0.85m Contrast Mustard Tussar Blouse',
          length: '5.5m + 0.85m Blouse',
          origin: 'Bhagalpur, Bihar',
          toneA: '#1B263B',
          toneB: '#C9A43B',
          img: '/src/assests/images/catalog/navy_tussar_saree_1792474503287.jpg',
          stock: 7,
          featured: 0,
          newArrival: 1,
          bestSeller: 1,
          rating: 4.90,
          reviews: 14
        },
        {
          name: 'The Empress Kalamkari Jamdani',
          slug: 'empress-kalamkari-jamdani',
          sku: 'VAG-KAL-007',
          desc: 'Royal purple mulberry silk featuring authentic hand-drawn Sri Kalahasti pen Kalamkari depicting celestial musicians and blooming lotus ponds.',
          price: 52000,
          origPrice: 62000,
          costPrice: 30000,
          fabric: 'Kalakaari Handloom Silk',
          weave: 'Pen Kalamkari on Handwoven Silk',
          zari: 'Pure Vintage Gold Zari',
          border: 'Lotus Sanctuary Temple Border',
          blouse: 'Includes 0.9m Kalamkari Painted Blouse Fabric',
          length: '5.5m + 0.9m Blouse',
          origin: 'Sri Kalahasti & Kanchipuram',
          toneA: '#4A154B',
          toneB: '#C9A43B',
          img: '/src/assests/images/catalog/royal_purple_saree_1792474526549.jpg',
          stock: 3,
          featured: 1,
          newArrival: 1,
          bestSeller: 0,
          rating: 4.98,
          reviews: 29
        },
        {
          name: 'Kurinji Chettinad Handspun Cotton',
          slug: 'kurinji-chettinad-handspun-cotton',
          sku: 'VAG-COT-008',
          desc: 'Traditional high-twist 100s count Chettinad handloom cotton in earth ochre and charcoal, featuring the classic striped temple border.',
          price: 11200,
          origPrice: 14000,
          costPrice: 6000,
          fabric: 'Chettinad Cotton',
          weave: '100s Count Handloom Weave',
          zari: 'Subtle Thread Zari Border',
          border: 'Traditional Chettinad Contrast Border',
          blouse: 'Includes 0.8m Running Cotton Blouse',
          length: '5.5m + 0.8m Blouse',
          origin: 'Karaikudi, Tamil Nadu',
          toneA: '#70594B',
          toneB: '#29201E',
          img: '/src/assests/images/catalog/handloom_cotton_saree_1792474579643.jpg',
          stock: 20,
          featured: 0,
          newArrival: 0,
          bestSeller: 1,
          rating: 4.89,
          reviews: 21
        }
      ];

      const stmt = sdb.prepare(`
        INSERT INTO products (
          name, slug, sku, description, price, original_price, cost_price, fabric,
          weave, zari_type, border_style, blouse_details, length, origin,
          tone_a, tone_b, image_url, stock, is_featured, is_new_arrival, is_best_seller,
          rating, reviews_count
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?
        )
      `);

      products.forEach((p) => {
        stmt.run(
          p.name, p.slug, p.sku, p.desc, p.price, p.origPrice, p.costPrice, p.fabric,
          p.weave, p.zari, p.border, p.blouse, p.length, p.origin,
          p.toneA, p.toneB, p.img, p.stock, p.featured, p.newArrival, p.bestSeller,
          p.rating, p.reviews
        );
      });
      console.log('✅ Saree catalog seeded with detailed specifications.');
    }

    // Seed Sample Orders
    const countOrders = sdb.prepare("SELECT COUNT(*) as count FROM orders").get().count;
    if (countOrders === 0) {
      const orders = [
        {
          orderNumber: 'VAG-2026-981423',
          customerName: 'Ananya Radhakrishnan',
          email: 'ananya.radha@gmail.com',
          phone: '+91 98412 77890',
          address: 'Villa 14, Lotus Springs, ECR',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600041',
          subtotal: 48500,
          discount: 4850,
          coupon: 'VAAGAI10',
          total: 43650,
          method: 'upi',
          paymentStatus: 'completed',
          orderStatus: 'shipped',
          carrier: 'BlueDart Express',
          tracking: 'BD89421578IN',
          items: [
            { id: 1, name: 'The Crimson Mayil Kanjivaram', sku: 'VAG-KAN-001', price: 48500, qty: 1, img: '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg' }
          ]
        },
        {
          orderNumber: 'VAG-2026-764102',
          customerName: 'Dr. Priya Sundaram',
          email: 'priya.sundaram@aiims.edu',
          phone: '+91 94441 55621',
          address: '42, Sadashivnagar 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560080',
          subtotal: 75700,
          discount: 0,
          coupon: null,
          total: 75700,
          method: 'card',
          paymentStatus: 'completed',
          orderStatus: 'delivered',
          carrier: 'DTDC Premium',
          tracking: 'DT55219084IN',
          items: [
            { id: 2, name: 'Ivory Aab-e-Zar Swarnachari Saree', sku: 'VAG-BAN-002', price: 36200, qty: 1, img: '/src/assests/images/catalog/ivory_gold_saree_1792474405497.jpg' },
            { id: 4, name: 'Haldi Mustard Vaddanam Kanjivaram', sku: 'VAG-KAN-004', price: 39500, qty: 1, img: '/src/assests/images/catalog/mustard_festive_saree_1792474451533.jpg' }
          ]
        },
        {
          orderNumber: 'VAG-2026-621899',
          customerName: 'Sowmya Venkat',
          email: 'sowmya.v@outlook.com',
          phone: '+91 99801 44321',
          address: 'Flat 6B, Jubilee Hills Heights',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500033',
          subtotal: 52000,
          discount: 0,
          coupon: null,
          total: 52000,
          method: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'confirmed',
          carrier: 'Delhivery Surface',
          tracking: 'DL99081276IN',
          items: [
            { id: 7, name: 'The Empress Kalamkari Jamdani', sku: 'VAG-KAL-007', price: 52000, qty: 1, img: '/src/assests/images/catalog/royal_purple_saree_1792474526549.jpg' }
          ]
        }
      ];

      const insOrder = sdb.prepare(`
        INSERT INTO orders (
          order_number, customer_name, email, phone, shipping_address,
          city, state, postal_code, subtotal, discount_amount, coupon_code,
          total_amount, payment_method, payment_status, order_status,
          shipping_carrier, tracking_number, timeline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insItem = sdb.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, sku, price, quantity, subtotal, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      orders.forEach((o) => {
        const timeline = JSON.stringify([
          { time: new Date().toISOString(), status: 'placed', note: 'Order received from online boutique' },
          { time: new Date().toISOString(), status: o.orderStatus, note: `Status updated to ${o.orderStatus}` }
        ]);

        const res = insOrder.run(
          o.orderNumber, o.customerName, o.email, o.phone, o.address,
          o.city, o.state, o.postalCode, o.subtotal, o.discount, o.coupon,
          o.total, o.method, o.paymentStatus, o.orderStatus,
          o.carrier, o.tracking, timeline
        );

        const orderId = res.lastInsertRowid;
        o.items.forEach((it) => {
          insItem.run(orderId, it.id, it.name, it.sku, it.price, it.qty, it.price * it.qty, it.img);
        });
      });
      console.log('✅ Sample orders seeded with items and delivery tracking.');
    }

    // Seed Coupons
    const countCoupons = sdb.prepare("SELECT COUNT(*) as count FROM coupons").get().count;
    if (countCoupons === 0) {
      const coupons = [
        { code: 'VAAGAI10', desc: '10% Welcome gift for new patrons', type: 'percentage', val: 10, min: 15000, max: 5000 },
        { code: 'HERITAGE20', desc: 'Flat ₹2,500 off on Kanjivaram orders above ₹40,000', type: 'fixed', val: 2500, min: 40000, max: 2500 },
        { code: 'FESTIVE15', desc: '15% Seasonal Festive Privilege', type: 'percentage', val: 15, min: 25000, max: 6000 },
        { code: 'FREESHIP', desc: 'Complimentary Express Insured Shipping', type: 'free_shipping', val: 0, min: 0, max: 0 }
      ];

      const stmt = sdb.prepare(`
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      coupons.forEach((c) => stmt.run(c.code, c.desc, c.type, c.val, c.min, c.max));
      console.log('✅ Coupons seeded.');
    }

    // Seed Store Settings
    const countSettings = sdb.prepare("SELECT COUNT(*) as count FROM store_settings").get().count;
    if (countSettings === 0) {
      sdb.prepare(`
        INSERT INTO store_settings (
          store_name, tagline, support_email, support_phone, address,
          currency, free_shipping_threshold, standard_shipping_fee, tax_percentage,
          announcement_text, announcement_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'VAAGAI Luxury Sarees',
        'Artisanal South Indian Saree Atelier',
        'concierge@vaagai.com',
        '+91 98400 12345',
        '104 Cathedral Road, Gopalapuram, Chennai, Tamil Nadu 600086',
        'INR',
        5000,
        0,
        5.0,
        'Complimentary Pan-India Express Delivery & Bespoke Blouse Tailoring on all Orders.',
        1
      );
      console.log('✅ Store settings initialized.');
    }

    // Seed Homepage CMS
    const countCms = sdb.prepare("SELECT COUNT(*) as count FROM homepage_cms").get().count;
    if (countCms === 0) {
      const heroContent = JSON.stringify({
        eyebrow: 'Artisanal Heritage — Chennai Atelier',
        title: 'Timeless South Indian Couture',
        subtitle: 'Crafted from pure mulberry silk, hand-woven gold zari, and centuries of temple craftsmanship.',
        primaryCtaText: 'Explore Collection',
        primaryCtaLink: '#collection',
        secondaryCtaText: 'Kalakaari Art',
        secondaryCtaLink: '#kalakaari',
        badgeText: 'Handloom Certified'
      });

      const announcementContent = JSON.stringify({
        text: 'Complimentary Pan-India Express Delivery & Bespoke Blouse Tailoring on all Orders.',
        linkText: 'Discover Kalakaari',
        linkUrl: '#kalakaari',
        enabled: true
      });

      sdb.prepare("INSERT INTO homepage_cms (section_key, content_json) VALUES (?, ?)").run('hero', heroContent);
      sdb.prepare("INSERT INTO homepage_cms (section_key, content_json) VALUES (?, ?)").run('announcement', announcementContent);
      console.log('✅ Homepage CMS initialized.');
    }

    // Seed Sample Patron Account
    const existingPatron = sdb.prepare("SELECT id FROM users WHERE email = ?").get('priya.s@example.com');
    let patronId = existingPatron ? existingPatron.id : null;
    if (!existingPatron) {
      const pHash = bcrypt.hashSync('Priya@2026', 10);
      const pRes = sdb.prepare(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES (?, ?, ?, 'customer', '+91 98401 55678')
      `).run('Priya Sundararajan', 'priya.s@example.com', pHash);
      patronId = pRes.lastInsertRowid;

      // Seed Default Address
      sdb.prepare(`
        INSERT INTO customer_addresses (user_id, name, phone, street_address, city, state, postal_code, country, address_type, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        patronId,
        'Priya Sundararajan',
        '+91 98401 55678',
        'Flat 4B, Emerald Court, 18 Poes Garden',
        'Chennai',
        'Tamil Nadu',
        '600086',
        'India',
        'Home',
        1
      );
      console.log('✅ Sample patron account & address initialized.');
    }

    // Seed Sample Order Return Request
    const countReturns = sdb.prepare("SELECT COUNT(*) as count FROM order_returns").get().count;
    if (countReturns === 0) {
      const deliveredOrd = sdb.prepare("SELECT * FROM orders WHERE order_status = 'delivered' LIMIT 1").get();
      if (deliveredOrd) {
        sdb.prepare(`
          INSERT INTO order_returns (
            order_id, order_number, user_id, customer_name, customer_email,
            product_id, product_name, reason, description, status, refund_amount, admin_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          deliveredOrd.id,
          deliveredOrd.order_number,
          deliveredOrd.user_id || patronId,
          deliveredOrd.customer_name,
          deliveredOrd.email,
          2,
          'Forest Emerald Shikarghar Banarasi Brocade',
          'Slight fabric tone difference under indoor lighting',
          'Would love to exchange for the Crimson Mayil Kanjivaram instead.',
          'requested',
          54000,
          'Awaiting atelier inspection protocol.'
        );
        console.log('✅ Sample return request initialized.');
      }
    }
  }
}

/**
 * Universal query function supporting both PostgreSQL and SQLite seamlessly
 */
export async function query(text, params = []) {
  if (isSqliteMode) {
    const sdb = getSqlite();
    const adaptedSql = adaptSqlForSqlite(text);

    try {
      const trimmed = adaptedSql.trim();
      const isSelect = /^SELECT/i.test(trimmed);

      if (isSelect) {
        const rows = sdb.prepare(adaptedSql).all(...params);
        return { rows, rowCount: rows.length };
      } else {
        // Handle INSERT / UPDATE / DELETE
        if (/RETURNING/i.test(adaptedSql)) {
          const rows = sdb.prepare(adaptedSql).all(...params);
          return { rows, rowCount: rows.length };
        } else {
          const info = sdb.prepare(adaptedSql).run(...params);
          return {
            rows: [],
            rowCount: info.changes,
            lastInsertRowid: info.lastInsertRowid,
          };
        }
      }
    } catch (error) {
      console.error(`[SQLite Error]: ${error.message}\nQuery: ${text}`);
      throw error;
    }
  }

  // PostgreSQL Mode
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    // Only switch to SQLite on genuine network/connection failures, not data constraint violations
    const isConnError = error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === '08006' || error.message.includes('timeout') || error.message.includes('Connection terminated');
    if (!isSqliteMode && isConnError) {
      console.warn(`[PG Connection Lost, switching to SQLite]: ${error.message}`);
      isSqliteMode = true;
      await initializeDatabase();
      return query(text, params);
    }
    throw error;
  }
}

/**
 * Checks database connectivity and auto-activates SQLite fallback if PG is unreachable
 */
export async function testConnection() {
  if (isSqliteMode) {
    return {
      ok: true,
      type: 'SQLite (Embedded Resilient Engine)',
      message: 'Operating on resilient embedded SQLite storage (vaagai.db)',
      path: sqlitePath,
    };
  }

  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    isSqliteMode = false;
    return {
      ok: true,
      type: 'PostgreSQL (Cloud Supabase Instance)',
      message: `Connected successfully to PostgreSQL database "${res.rows[0].db}"`,
      now: res.rows[0].now,
      database: res.rows[0].db,
    };
  } catch (error) {
    console.error('[PG Connection Error]:', error.message);
    isSqliteMode = true;
    try {
      await initializeDatabase();
      return {
        ok: true,
        type: 'SQLite (Embedded Resilient Engine)',
        message: 'PostgreSQL unavailable; successfully operating on resilient embedded SQLite storage (vaagai.db)',
        path: sqlitePath,
      };
    } catch (sqliteErr) {
      return {
        ok: false,
        type: 'None',
        message: `Both PostgreSQL and SQLite initialization failed: ${sqliteErr.message}`,
        error: sqliteErr.message,
      };
    }
  }
}

// Auto-test on boot and initialize
testConnection().then((status) => {
  if (status.ok) {
    console.log(`🗄️  [Database Ready]: ${status.type} - ${status.message}`);
  } else {
    console.error(`❌ [Database Error]: ${status.message}`);
  }
});

export { pool, isSqliteMode };

export default {
  pool,
  query,
  testConnection,
  initializeDatabase,
};
