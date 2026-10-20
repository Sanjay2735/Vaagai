# 🥻 Vaagai Backend API

> **Artisanal Luxury E-Commerce Backend Service**  
> High-performance RESTful API built with **Node.js**, **Express**, and **PostgreSQL**.

---

## 🏛️ Architectural Overview

The **Vaagai** backend manages authentication, catalog curation, transactional order placement, inventory deduction, reviews, and client concierge dispatches.

```text
Vaagai/server/
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL Pool & SSL configuration
│   ├── controllers/
│   │   ├── authController.js     # User registration, JWT login & profiles
│   │   ├── productController.js  # Catalog search, filtering & admin CRUD
│   │   ├── orderController.js    # Multi-item checkout, inventory & tracking
│   │   ├── reviewController.js   # Customer ratings & reviews
│   │   ├── newsletterController.js# Salon subscriptions
│   │   └── contactController.js   # Bespoke inquiries & concierge
│   ├── db/
│   │   ├── schema.sql            # PostgreSQL DDL table definitions & indexes
│   │   ├── init.js               # Database schema initialization runner
│   │   └── seed.js               # Initial seeding (products, categories, admin)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role guard (requireAdmin)
│   │   └── errorHandler.js       # Centralized error formatting & PostgreSQL codes
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── newsletterRoutes.js
│   │   └── contactRoutes.js
│   ├── app.js                    # Express app configuration & CORS
│   └── server.js                 # Entry point with health verification
├── .env.example                  # Environment configuration template
├── .env                          # Local environment variables
└── package.json
```

---

## 🗄️ Database Schema (PostgreSQL)

| Table | Description | Key Fields |
|---|---|---|
| `users` | Customer & Admin Accounts | `id`, `name`, `email`, `password_hash`, `role` (`customer` \| `admin`) |
| `categories` | Saree Weaving Categories | `id`, `name`, `slug`, `description`, `image_url` |
| `products` | Luxury Saree Catalog | `id`, `name`, `slug`, `price`, `fabric`, `tone_a`, `tone_b`, `stock`, `rating` |
| `orders` | Transactional Orders | `id`, `order_number` (`VAG-2026-XXXX`), `subtotal`, `payment_status`, `order_status` |
| `order_items` | Products in an Order | `id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal` |
| `reviews` | Customer Ratings & Comments | `id`, `product_id`, `author_name`, `rating` (1–5), `comment` |
| `newsletter_subscribers` | VIP Salon Subscriptions | `id`, `email`, `is_active`, `subscribed_at` |
| `contact_inquiries` | Bespoke Concierge Messages | `id`, `name`, `email`, `phone`, `subject`, `message`, `status` |

---

## 🚀 Quick Start Guide

### 1. Configure PostgreSQL Connection

In `Vaagai/server/.env`, configure your PostgreSQL database:

```env
PORT=5000
NODE_ENV=development

# Option A: Cloud Connection URI (Neon / Supabase / Railway)
DATABASE_URL=postgresql://username:password@ep-sample-project.us-east-2.aws.neon.tech/neondb?sslmode=require

# Option B: Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vaagai_db
```

### 2. Initialize and Seed the Database

Run the automated initialization and seed runner:

```bash
# In Vaagai/server:
npm run db:setup

# Or from Vaagai root:
npm run server:setup
```

This will automatically:
1. Create all 8 tables and performance indexes.
2. Seed the 8 authentic Vaagai sarees matching the frontend design.
3. Create the default Admin and Customer accounts:
   - **Admin:** `admin@vaagai.com` / `Admin@Vaagai2026!`
   - **Customer:** `customer@example.com` / `Customer123!`

### 3. Start the Server

```bash
# In Vaagai/server:
npm run dev

# Or from Vaagai root:
npm run server
```

The server runs on **`http://localhost:5000`** with live reload.

---

## 📡 API Reference

### 🩺 Health & Diagnostic
| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Service status, uptime, and PostgreSQL connectivity check |

### 🔐 Authentication (`/api/auth`)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register customer (`name`, `email`, `password`, `phone`) |
| `/api/auth/login` | `POST` | Public | Log in with email and password (returns JWT token) |
| `/api/auth/me` | `GET` | Bearer Token | Retrieve authenticated user profile |
| `/api/auth/profile` | `PUT` | Bearer Token | Update customer profile (`name`, `phone`) |

### 🥻 Products & Catalog (`/api/products`)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/products` | `GET` | Public | List sarees with search (`q`), filter (`fabric`, `tone`), pagination & sorting |
| `/api/products/categories`| `GET` | Public | Retrieve curated weaving categories |
| `/api/products/:idOrSlug` | `GET` | Public | Retrieve product details by ID or slug with reviews |
| `/api/products` | `POST` | Admin | Create a new saree product |
| `/api/products/:id` | `PUT` | Admin | Update product details, pricing, or stock |
| `/api/products/:id` | `DELETE` | Admin | Delete product from catalog |

### 📦 Orders & Checkout (`/api/orders`)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/orders` | `POST` | Public / Guest | Place order with customer shipping address & cart items |
| `/api/orders/my` | `GET` | Customer | Fetch current logged-in customer's order history |
| `/api/orders/:orderNumber`| `GET` | Public / Owner | Track order details by reference (`VAG-2026-XXXX`) |
| `/api/orders` | `GET` | Admin | Retrieve all orders across the atelier |
| `/api/orders/:id/status` | `PATCH`| Admin | Update order status (`placed`, `shipped`, `delivered`, etc.) |

### ⭐ Reviews (`/api/reviews`)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/reviews/:productId`| `GET` | Public | Fetch reviews and ratings for a saree |
| `/api/reviews` | `POST` | Public / User | Add verified review (auto-recalculates average rating) |

### 💌 Newsletter & Salon (`/api/newsletter`)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/newsletter/subscribe`| `POST` | Public | Enroll email in private salon dispatches |
| `/api/newsletter/subscribers`| `GET` | Admin | List all newsletter subscribers |

### 🏛️ Bespoke Concierge (`/api/contact`)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/contact` | `POST` | Public | Submit bespoke styling / atelier consultation inquiry |
| `/api/contact/inquiries`| `GET` | Admin | List client inquiries |
