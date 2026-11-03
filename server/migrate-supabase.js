import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const uri = 'postgresql://postgres:Arul%400901%4020056@db.vxjpuwdsaxbngjhvxyuf.supabase.co:5432/postgres';

async function migrate() {
  console.log('🚀 Connecting to Supabase PostgreSQL at db.vxjpuwdsaxbngjhvxyuf.supabase.co...');
  const client = new Client({
    connectionString: uri,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL!');

  console.log('📦 Creating database tables...');

  await client.query(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      phone VARCHAR(50),
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 3. Collections Table
    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      subtitle TEXT,
      description TEXT,
      banner_url TEXT,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 4. Products Table
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      sku VARCHAR(100) UNIQUE,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      original_price NUMERIC(10, 2),
      cost_price NUMERIC(10, 2),
      fabric VARCHAR(100) NOT NULL,
      weave VARCHAR(100) DEFAULT 'Handloom',
      zari_type VARCHAR(100) DEFAULT 'Pure Gold Zari',
      border_style VARCHAR(100) DEFAULT 'Traditional Temple Border',
      blouse_details TEXT DEFAULT 'Includes 0.8m running blouse piece',
      length VARCHAR(100) DEFAULT '5.5m + 0.8m Blouse',
      origin VARCHAR(100) DEFAULT 'Kanchipuram, Tamil Nadu',
      care_instructions TEXT DEFAULT 'Strictly Dry Clean Only',
      tone_a VARCHAR(50) DEFAULT 'Crimson',
      tone_b VARCHAR(50) DEFAULT 'Antique Gold',
      image_url TEXT,
      gallery_images TEXT DEFAULT '[]',
      stock INTEGER NOT NULL DEFAULT 10,
      low_stock_threshold INTEGER DEFAULT 5,
      status VARCHAR(50) DEFAULT 'active',
      is_featured INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 1,
      is_best_seller INTEGER DEFAULT 0,
      rating NUMERIC(3, 2) DEFAULT 4.90,
      reviews_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 5. Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(64) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      shipping_address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) DEFAULT 'India',
      subtotal NUMERIC(10, 2) NOT NULL,
      discount_amount NUMERIC(10, 2) DEFAULT 0,
      coupon_code VARCHAR(50),
      shipping_fee NUMERIC(10, 2) DEFAULT 0,
      tax_amount NUMERIC(10, 2) DEFAULT 0,
      total_amount NUMERIC(10, 2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'cod',
      payment_status VARCHAR(50) DEFAULT 'pending',
      order_status VARCHAR(50) DEFAULT 'placed',
      shipping_carrier VARCHAR(100),
      tracking_number VARCHAR(100),
      tracking_url TEXT,
      notes TEXT,
      timeline TEXT DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 6. Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100),
      price NUMERIC(10, 2) NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal NUMERIC(10, 2) NOT NULL,
      image_url TEXT
    );

    -- 7. Inventory Logs Table
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      change_amount INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT DEFAULT 'manual_adjustment',
      admin_user VARCHAR(100) DEFAULT 'System',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 8. Coupons Table
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      discount_type VARCHAR(50) DEFAULT 'percentage',
      discount_value NUMERIC(10, 2) NOT NULL,
      min_order_amount NUMERIC(10, 2) DEFAULT 0,
      max_discount_amount NUMERIC(10, 2),
      usage_limit INTEGER DEFAULT 100,
      times_used INTEGER DEFAULT 0,
      start_date TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 9. Reviews Table
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      author_name VARCHAR(100) NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'approved',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 10. Homepage CMS Table
    CREATE TABLE IF NOT EXISTS homepage_cms (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(100) UNIQUE NOT NULL,
      content_json TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 11. Activity Logs Table
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 12. Store Settings Table
    CREATE TABLE IF NOT EXISTS store_settings (
      id SERIAL PRIMARY KEY,
      store_name VARCHAR(255) DEFAULT 'VAAGAI Luxury Sarees',
      tagline TEXT DEFAULT 'Artisanal South Indian Saree Atelier',
      support_email VARCHAR(255) DEFAULT 'concierge@vaagai.com',
      support_phone VARCHAR(50) DEFAULT '+91 98400 12345',
      address TEXT DEFAULT '104 Cathedral Road, Gopalapuram, Chennai, Tamil Nadu 600086',
      currency VARCHAR(10) DEFAULT 'INR',
      free_shipping_threshold NUMERIC(10, 2) DEFAULT 5000,
      standard_shipping_fee NUMERIC(10, 2) DEFAULT 0,
      tax_percentage NUMERIC(5, 2) DEFAULT 5.0,
      announcement_text TEXT DEFAULT 'Complimentary Pan-India Express Delivery & Bespoke Blouse Tailoring on all Orders.',
      announcement_enabled INTEGER DEFAULT 1,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 13. Newsletter Subscribers Table
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 14. Contact Inquiries Table
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'unread',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 15. Customer Addresses Table
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      street_address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) DEFAULT 'India',
      address_type VARCHAR(50) DEFAULT 'Home',
      is_default INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 16. Wishlist Items Table
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );

    -- 17. Order Returns Table
    CREATE TABLE IF NOT EXISTS order_returns (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      order_number VARCHAR(64) NOT NULL,
      user_id INTEGER,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      product_id INTEGER,
      product_name VARCHAR(255) NOT NULL,
      reason TEXT NOT NULL,
      description TEXT,
      photo_url TEXT,
      status VARCHAR(50) DEFAULT 'requested',
      refund_amount NUMERIC(10, 2) NOT NULL,
      admin_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_fabric ON products(fabric);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Ensure users table supports all staff and admin roles
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('customer', 'admin', 'super_admin', 'product_manager', 'order_manager', 'curator'));

    -- Backfill missing columns on existing tables
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1;

    ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1;

    ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS weave VARCHAR(100) DEFAULT 'Handloom';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS zari_type VARCHAR(100) DEFAULT 'Pure Gold Zari';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS border_style VARCHAR(100) DEFAULT 'Traditional Temple Border';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS blouse_details TEXT DEFAULT 'Includes 0.8m running blouse piece';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS length VARCHAR(100) DEFAULT '5.5m + 0.8m Blouse';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS origin VARCHAR(100) DEFAULT 'Kanchipuram, Tamil Nadu';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT DEFAULT 'Strictly Dry Clean Only';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images TEXT DEFAULT '[]';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

    ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS timeline TEXT DEFAULT '[]';

    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
  `);

  console.log('✅ All 17 tables and indexes created successfully!');

  // Seed default admin accounts if not existing
  const adminCheck = await client.query("SELECT id FROM users WHERE email = 'admin@vaagai.com'");
  if (adminCheck.rows.length === 0) {
    const hash = bcrypt.hashSync('Admin@Vaagai2026!', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES 
        ('Vaagai Super Admin', 'admin@vaagai.com', $1, 'super_admin', '+91 98400 12345'),
        ('Meenakshi Sundaram (Curator)', 'curator@vaagai.com', $2, 'product_manager', '+91 98400 23456'),
        ('Karthik Raman (Fulfillment)', 'orders@vaagai.com', $3, 'order_manager', '+91 98400 34567')
    `, [hash, bcrypt.hashSync('Curator@2026', 10), bcrypt.hashSync('Orders@2026', 10)]);
    console.log('✅ Super Admin & Staff Accounts seeded.');
  }

  // Seed Categories
  const catCheck = await client.query("SELECT COUNT(*) as count FROM categories");
  if (parseInt(catCheck.rows[0].count) === 0) {
    const categories = [
      ['Kanjivaram Silk', 'kanjivaram', 'Regal pure mulberry silk woven with gold zari from Kanchipuram.', '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg', 1],
      ['Banarasi Brocade', 'banarasi', 'Intricate Mughal and floral motifs woven in pure Varanasi silk.', '/src/assests/images/catalog/bottle_green_banarasi_1792474427242.jpg', 2],
      ['Chanderi & Organza', 'organza', 'Sheer lightweight weaves adorned with delicate metallic borders.', '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg', 3],
      ['Tussar Heritage', 'tussar', 'Raw textured wild silk sarees with artisanal hand-block and Kalamkari prints.', '/src/assests/images/catalog/navy_tussar_saree_1792474503287.jpg', 4],
      ['Royal Kalakaari', 'kalakaari', 'Masterpiece hand-painted pen Kalamkari on vintage South Indian silks.', '/src/assests/images/catalog/royal_purple_saree_1792474526549.jpg', 5],
      ['Handloom Cotton', 'cotton', 'Breathable Chettinad and Mangalagiri cottons for festive understated grace.', '/src/assests/images/catalog/handloom_cotton_saree_1792474579643.jpg', 6]
    ];
    for (const cat of categories) {
      await client.query(
        "INSERT INTO categories (name, slug, description, image_url, display_order) VALUES ($1, $2, $3, $4, $5)",
        cat
      );
    }
    console.log('✅ Categories seeded.');
  }

  // Seed Collections
  const colCheck = await client.query("SELECT COUNT(*) as count FROM collections");
  if (parseInt(colCheck.rows[0].count) === 0) {
    const collections = [
      ['The Royal Bridal Sanctuary', 'bridal-sanctuary', 'Heirloom Kanjivaram Weaves', 'Exquisite heavy-weight Kanjivarams with 3-ply silk and real gold zari for temple weddings.', '/src/assests/images/banner/banner-1.png', 1, 1],
      ['Kalaakaari Handloom Atelier', 'kalakaari-atelier', 'Handpainted Sri Kalahasti Art', 'Each drape represents 45 days of organic vegetable dye sketching by master artisans.', '/src/assests/images/banner/banner-2.png', 1, 2],
      ['Summer Gossamer Weaves', 'summer-gossamer', 'Featherlight Organza & Chanderi', 'Ethereal pastel tones designed for sunlit morning rituals and intimate soirees.', '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg', 0, 3],
      ['Temple Border Heritage', 'temple-borders', 'Classic Korvai Interlock Borders', 'Timeless contrasting borders woven using ancient Korvai shuttle techniques.', '/src/assests/images/catalog/ivory_gold_saree_1792474405497.jpg', 1, 4]
    ];
    for (const col of collections) {
      await client.query(
        "INSERT INTO collections (title, slug, subtitle, description, banner_url, is_featured, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        col
      );
    }
    console.log('✅ Collections seeded.');
  }

  // Seed Products
  const prodCheck = await client.query("SELECT COUNT(*) as count FROM products");
  if (parseInt(prodCheck.rows[0].count) === 0) {
    const products = [
      [
        'The Crimson Mayil Kanjivaram',
        'crimson-mayil-kanjivaram',
        'VAG-KAN-001',
        'Woven in the ancient temple town of Kanchipuram, this masterpiece features 3-ply pure mulberry silk drenched in deep crimson with antique peacock (Mayil) chakram zari motifs along the border.',
        48500, 56000, 28000,
        'Kanjivaram Silk', 'Korvai Handloom', 'Pure 2G Gold Zari',
        'Korvai Temple Mayil Border', 'Includes 0.85m Contrast Emerald Silk Blouse',
        '5.5m + 0.85m Blouse (48 in width)', 'Kanchipuram, Tamil Nadu',
        '#720F25', '#C9A43B',
        '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg',
        8, 1, 1, 1, 4.95, 34
      ],
      [
        'Ivory Aab-e-Zar Swarnachari Saree',
        'ivory-aab-e-zar-swarnachari',
        'VAG-BAN-002',
        'An ethereal marriage of celestial ivory katan silk intertwined with intricate antique silver and electroplated gold floral vines across the pallu.',
        36200, 42000, 20000,
        'Pure Katan Silk', 'Brocade Jaal Handloom', 'Antique Gold & Silver Zari',
        'Intricate Floral Kalka Border', 'Includes 0.8m Tone-on-Tone Brocade Blouse',
        '5.5m + 0.8m Blouse', 'Varanasi, Uttar Pradesh',
        '#F5EEE5', '#C9A43B',
        '/src/assests/images/catalog/ivory_gold_saree_1792474405497.jpg',
        12, 1, 1, 0, 4.90, 22
      ],
      [
        'Forest Emerald Shikarghar Banarasi Brocade',
        'forest-emerald-shikarghar-banarasi',
        'VAG-BAN-003',
        'Heritage deep emerald green pure banarasi silk adorned with mythical fauna motifs and dense gold brocade jaal work.',
        54000, 62000, 31000,
        'Banarasi Katan Silk', 'Shikarghar Royal Weave', 'Real Tested Gold Zari',
        'Heavy Shikarghar Royal Border', 'Includes 0.9m Contrast Rani Pink Blouse',
        '5.5m + 0.9m Blouse', 'Varanasi, Uttar Pradesh',
        '#0E3A2F', '#C9A43B',
        '/src/assests/images/catalog/bottle_green_banarasi_1792474427242.jpg',
        5, 1, 0, 1, 4.98, 48
      ],
      [
        'Haldi Mustard Vaddanam Kanjivaram',
        'haldi-mustard-vaddanam-kanjivaram',
        'VAG-KAN-004',
        'A celebratory auspicious turmeric-hued silk saree highlighted with rich magenta contrast temple border and traditional Rudraksha motifs.',
        39500, 45000, 22000,
        'Kanjivaram Silk', 'Traditional Pit-Loom', 'Pure Gold Zari',
        'Contrast Magenta Korvai Border', 'Includes 0.8m Contrast Magenta Blouse',
        '5.5m + 0.8m Blouse', 'Kanchipuram, Tamil Nadu',
        '#D4A017', '#720F25',
        '/src/assests/images/catalog/mustard_festive_saree_1792474451533.jpg',
        6, 0, 1, 1, 4.88, 19
      ],
      [
        'Gulabi Rooh Organza & Zardozi Drape',
        'gulabi-rooh-organza-zardozi',
        'VAG-ORG-005',
        'Translucent powdery blush pink silk organza hand-embellished with delicate French knots and antique dabka metallic embroidery along scalloped edges.',
        31000, 36000, 17500,
        'Silk Organza', 'Handwoven Sheer Weave with Hand Zardozi', 'Muted Rose Gold Zari',
        'Scalloped Zardozi Needlework Border', 'Includes Unstitched Heavy Embroidered Raw Silk Blouse',
        '5.5m + 1m Blouse Fabric', 'Chanderi & Lucknow',
        '#E8C4C4', '#D4AF37',
        '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg',
        4, 1, 1, 0, 4.85, 9
      ],
      [
        'Midnight Neelambari Tussar Saree',
        'midnight-neelambari-tussar',
        'VAG-TUS-006',
        'Rich textured wild tussar silk in deep midnight navy with heritage hand-block printed tribal motifs and antique brass zari selvedge.',
        28900, 34000, 16000,
        'Raw Tussar Silk', 'Artisanal Handloom Slub Weave', 'Antique Muted Copper Zari',
        'Block-Printed Geometric Border', 'Includes 0.85m Contrast Mustard Tussar Blouse',
        '5.5m + 0.85m Blouse', 'Bhagalpur, Bihar',
        '#1B263B', '#C9A43B',
        '/src/assests/images/catalog/navy_tussar_saree_1792474503287.jpg',
        7, 0, 1, 1, 4.90, 14
      ],
      [
        'The Empress Kalamkari Jamdani',
        'empress-kalamkari-jamdani',
        'VAG-KAL-007',
        'Royal purple mulberry silk featuring authentic hand-drawn Sri Kalahasti pen Kalamkari depicting celestial musicians and blooming lotus ponds.',
        52000, 62000, 30000,
        'Kalakaari Handloom Silk', 'Pen Kalamkari on Handwoven Silk', 'Pure Vintage Gold Zari',
        'Lotus Sanctuary Temple Border', 'Includes 0.9m Kalamkari Painted Blouse Fabric',
        '5.5m + 0.9m Blouse', 'Sri Kalahasti & Kanchipuram',
        '#4A154B', '#C9A43B',
        '/src/assests/images/catalog/royal_purple_saree_1792474526549.jpg',
        3, 1, 1, 0, 4.98, 29
      ],
      [
        'Kurinji Chettinad Handspun Cotton',
        'kurinji-chettinad-handspun-cotton',
        'VAG-COT-008',
        'Traditional high-twist 100s count Chettinad handloom cotton in earth ochre and charcoal, featuring the classic striped temple border.',
        11200, 14000, 6000,
        'Chettinad Cotton', '100s Count Handloom Weave', 'Subtle Thread Zari Border',
        'Traditional Chettinad Contrast Border', 'Includes 0.8m Running Cotton Blouse',
        '5.5m + 0.8m Blouse', 'Karaikudi, Tamil Nadu',
        '#70594B', '#29201E',
        '/src/assests/images/catalog/handloom_cotton_saree_1792474579643.jpg',
        20, 0, 0, 1, 4.89, 21
      ]
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (
          name, slug, sku, description, price, original_price, cost_price, fabric,
          weave, zari_type, border_style, blouse_details, length, origin,
          tone_a, tone_b, image_url, stock, is_featured, is_new_arrival, is_best_seller,
          rating, reviews_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21,
          $22, $23
        )
      `, p);
    }
    console.log('✅ Products seeded.');
  }

  // Seed Sample Orders
  const ordCheck = await client.query("SELECT COUNT(*) as count FROM orders");
  if (parseInt(ordCheck.rows[0].count) === 0) {
    const orders = [
      {
        orderNumber: 'VAG-2026-891042',
        customerName: 'Ananya Raghavan',
        email: 'ananya.r@gmail.com',
        phone: '+91 98402 11984',
        address: 'Villa 14, Gardenia Enclave, Boat Club Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600028',
        subtotal: 48500,
        discount: 2500,
        coupon: 'HERITAGE20',
        total: 46000,
        method: 'card',
        paymentStatus: 'completed',
        orderStatus: 'shipped',
        carrier: 'BlueDart Air Apex',
        tracking: 'BD88219401IN',
        items: [
          { id: 1, name: 'The Crimson Mayil Kanjivaram', sku: 'VAG-KAN-001', price: 48500, qty: 1, img: '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg' }
        ]
      },
      {
        orderNumber: 'VAG-2026-745120',
        customerName: 'Dr. Radhika Menon',
        email: 'radhika.menon@kims.org',
        phone: '+91 94471 22849',
        address: 'Banyan House, Panampilly Nagar',
        city: 'Kochi',
        state: 'Kerala',
        postalCode: '682036',
        subtotal: 54000,
        discount: 0,
        coupon: null,
        total: 54000,
        method: 'upi',
        paymentStatus: 'completed',
        orderStatus: 'delivered',
        carrier: 'BlueDart Express',
        tracking: 'BD77189022IN',
        items: [
          { id: 3, name: 'Forest Emerald Shikarghar Banarasi Brocade', sku: 'VAG-BAN-003', price: 54000, qty: 1, img: '/src/assests/images/catalog/bottle_green_banarasi_1792474427242.jpg' }
        ]
      },
      {
        orderNumber: 'VAG-2026-902314',
        customerName: 'Meera Krishnan',
        email: 'meera.k@gmail.com',
        phone: '+91 98200 87654',
        address: '402, Sea Face Apartments, Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400018',
        subtotal: 75700,
        discount: 5000,
        coupon: 'VAAGAI10',
        total: 70700,
        method: 'card',
        paymentStatus: 'completed',
        orderStatus: 'processing',
        carrier: 'DTDC Priority',
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

    for (const o of orders) {
      const timeline = JSON.stringify([
        { time: new Date().toISOString(), status: 'placed', note: 'Order received from online boutique' },
        { time: new Date().toISOString(), status: o.orderStatus, note: `Status updated to ${o.orderStatus}` }
      ]);

      const res = await client.query(`
        INSERT INTO orders (
          order_number, customer_name, email, phone, shipping_address,
          city, state, postal_code, subtotal, discount_amount, coupon_code,
          total_amount, payment_method, payment_status, order_status,
          shipping_carrier, tracking_number, timeline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id
      `, [
        o.orderNumber, o.customerName, o.email, o.phone, o.address,
        o.city, o.state, o.postalCode, o.subtotal, o.discount, o.coupon,
        o.total, o.method, o.paymentStatus, o.orderStatus,
        o.carrier, o.tracking, timeline
      ]);

      const orderId = res.rows[0].id;
      for (const it of o.items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, product_name, sku, price, quantity, subtotal, image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [orderId, it.id, it.name, it.sku, it.price, it.qty, it.price * it.qty, it.img]);
      }
    }
    console.log('✅ Sample orders seeded with items and delivery tracking.');
  }

  // Seed Coupons
  const coupCheck = await client.query("SELECT COUNT(*) as count FROM coupons");
  if (parseInt(coupCheck.rows[0].count) === 0) {
    const coupons = [
      ['VAAGAI10', '10% Welcome gift for new patrons', 'percentage', 10, 15000, 5000],
      ['HERITAGE20', 'Flat ₹2,500 off on Kanjivaram orders above ₹40,000', 'fixed', 2500, 40000, 2500],
      ['FESTIVE15', '15% Seasonal Festive Privilege', 'percentage', 15, 25000, 6000],
      ['FREESHIP', 'Complimentary Express Insured Shipping', 'free_shipping', 0, 0, 0]
    ];
    for (const c of coupons) {
      await client.query(`
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, c);
    }
    console.log('✅ Coupons seeded.');
  }

  // Seed Store Settings
  const setCheck = await client.query("SELECT COUNT(*) as count FROM store_settings");
  if (parseInt(setCheck.rows[0].count) === 0) {
    await client.query(`
      INSERT INTO store_settings (
        store_name, tagline, support_email, support_phone, address,
        currency, free_shipping_threshold, standard_shipping_fee, tax_percentage,
        announcement_text, announcement_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
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
    ]);
    console.log('✅ Store settings initialized.');
  }

  // Seed Homepage CMS
  const cmsCheck = await client.query("SELECT COUNT(*) as count FROM homepage_cms");
  if (parseInt(cmsCheck.rows[0].count) === 0) {
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

    await client.query("INSERT INTO homepage_cms (section_key, content_json) VALUES ($1, $2)", ['hero', heroContent]);
    await client.query("INSERT INTO homepage_cms (section_key, content_json) VALUES ($1, $2)", ['announcement', announcementContent]);
    console.log('✅ Homepage CMS initialized.');
  }

  // Seed Sample Patron Account
  const patronCheck = await client.query("SELECT id FROM users WHERE email = 'priya.s@example.com'");
  let patronId = patronCheck.rows.length > 0 ? patronCheck.rows[0].id : null;
  if (!patronId) {
    const pHash = bcrypt.hashSync('Priya@2026', 10);
    const pRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ('Priya Sundararajan', 'priya.s@example.com', $1, 'customer', '+91 98401 55678')
      RETURNING id
    `, [pHash]);
    patronId = pRes.rows[0].id;

    await client.query(`
      INSERT INTO customer_addresses (user_id, name, phone, street_address, city, state, postal_code, country, address_type, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
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
    ]);
    console.log('✅ Sample patron account & address initialized.');
  }

  // Seed Sample Order Return Request
  const retCheck = await client.query("SELECT COUNT(*) as count FROM order_returns");
  if (parseInt(retCheck.rows[0].count) === 0) {
    const delOrd = await client.query("SELECT * FROM orders WHERE order_status = 'delivered' LIMIT 1");
    if (delOrd.rows.length > 0) {
      const o = delOrd.rows[0];
      await client.query(`
        INSERT INTO order_returns (
          order_id, order_number, user_id, customer_name, customer_email,
          product_id, product_name, reason, description, status, refund_amount, admin_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        o.id,
        o.order_number,
        o.user_id || patronId,
        o.customer_name,
        o.email,
        2,
        'Forest Emerald Shikarghar Banarasi Brocade',
        'Slight fabric tone difference under indoor lighting',
        'Would love to exchange for the Crimson Mayil Kanjivaram instead.',
        'requested',
        54000,
        'Awaiting atelier inspection protocol.'
      ]);
      console.log('✅ Sample return request initialized.');
    }
  }

  const allTables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log('🎉 SUPABASE MIGRATION COMPLETE! Created public tables:', allTables.rows.map(r => r.tablename).join(', '));

  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
