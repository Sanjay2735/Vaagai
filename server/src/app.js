import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { testConnection, query } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { validateCoupon } from './controllers/adminController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

// CORS configuration (allow requests from frontend Vite dev server or production URL)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev mode for smooth onboarding
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    service: 'Vaagai Artisanal E-Commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.type || 'PostgreSQL',
      connected: dbStatus.ok,
      message: dbStatus.message,
    },
  });
});

// Mount modular API routers
app.use('/api/admin', adminRoutes);
app.post('/api/coupons/validate', validateCoupon);

// Public CMS and Storefront settings endpoints
app.get('/api/content/:section', async (req, res, next) => {
  try {
    const { section } = req.params;
    const result = await query('SELECT content_json FROM homepage_cms WHERE section_key = $1', [section]);
    if (result.rows.length === 0) return res.json({ success: true, content: null });
    res.json({ success: true, section, content: JSON.parse(result.rows[0].content_json) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/settings', async (req, res, next) => {
  try {
    const result = await query('SELECT store_name, tagline, support_email, support_phone, address, currency, free_shipping_threshold, standard_shipping_fee, tax_percentage, announcement_text, announcement_enabled FROM store_settings LIMIT 1');
    res.json({ success: true, settings: result.rows[0] || {} });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Catch-all 404 for undefined routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
