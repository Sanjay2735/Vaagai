# Vaagai 🥻✨

> **Tradition Lives Beautifully** — An exquisite, artisanal e-commerce web experience showcasing handcrafted Indian sarees, heritage weaves, and timeless silk artistry.

---

## 🌟 Overview

**Vaagai** is a modern, high-performance web storefront designed to highlight the beauty of handloom traditions and luxury Indian ethnic wear. Built with React, Vite, and Tailwind CSS, the application offers an immersive shopping experience featuring smooth scroll dynamics, curated product collections, and an interactive cart system.

---

## ✨ Features

- **Heritage Showcase**: Dedicated curation for Kanjivaram, Kalamkari, Tussar Silk, Organza, and Chanderi sarees.
- **Interactive Cart Drawer**: Quick view, item count, quantity adjustments, and seamless checkout preparation powered by React Context.
- **Smooth Page Transitions & Reveals**: Fluid UI motion powered by `framer-motion` and custom CSS keyframes.
- **Curtain Launch Animation**: Elegant grand entrance reveal when visiting the store.
- **Section Navigation**: Clean hash-based routing supporting dedicated views (`#women-new`, `#kalakaari`) and smooth in-page anchors (`#new`, `#story`, `#explore`, `#trust`).
- **Responsive & Mobile First**: Meticulously designed for all screen sizes, from mobile phones to high-resolution displays.
- **Local Currency Support**: Built-in Indian Rupee (`₹`) price formatting and localized pricing details.

---

## 🛠️ Tech Stack

- **Core Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with PostCSS & Autoprefixer
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & Custom CSS Animations
- **Typography**: [Google Fonts (Jost)](https://fonts.google.com/specimen/Jost)

---

## 📁 Project Structure

```text
nasavu/
├── public/                 # Static assets
├── src/
│   ├── assests/            # Imagery, banners, and icons
│   ├── components/         # Reusable UI components
│   │   ├── Artistry.jsx    # Handloom process & artisan spotlight
│   │   ├── CartDrawer.jsx  # Interactive slide-over cart drawer
│   │   ├── Explore.jsx     # Category & drape exploration
│   │   ├── Footer.jsx      # Footer with links & newsletter
│   │   ├── Hero.jsx        # Hero carousel & CTA section
│   │   ├── Navbar.jsx      # Sticky navigation & search/cart toggles
│   │   ├── ProductCard.jsx # Product card with hover actions
│   │   ├── ProductGrid.jsx # Dynamic grid listing products
│   │   ├── Trust.jsx       # Quality badges & customer assurances
│   │   └── ...
│   ├── context/            # Global application state (ShopContext)
│   ├── data/               # Product catalog & constants
│   ├── styles/             # Animations & theme styles
│   ├── App.jsx             # Main application layout & router logic
│   ├── index.css           # Global Tailwind & typography styles
│   └── main.jsx            # React root mount
├── Index.html              # HTML entry template
├── package.json            # Project dependencies & npm scripts
├── tailwind.config.js      # Custom theme, colors & font family
└── vite.config.js          # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18+ recommended) installed.

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd c:/xampp/htdocs/nasavu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local Vite development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Production Build

To build the project for production deployment:
```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🌿 Git Setup

To track changes and commit your work:

```bash
git add .
git commit -m "chore: rename project to Vaagai"
```

---

## 📄 License

This project is proprietary and created for **Vaagai**. All rights reserved.
