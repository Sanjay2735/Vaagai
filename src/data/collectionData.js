import crimsonSaree from '../assests/images/catalog/saree-crimson-kanjivaram.jpg';
import ivorySaree from '../assests/images/catalog/saree-ivory-gold.jpg';
import greenBanarasi from '../assests/images/catalog/saree-bottle-green-banarasi.jpg';
import mustardSaree from '../assests/images/catalog/saree-mustard-festive.jpg';
import pinkOrganza from '../assests/images/catalog/saree-blush-pink-organza.jpg';
import navyTussar from '../assests/images/catalog/saree-navy-tussar.jpg';
import maroonBlouse from '../assests/images/catalog/blouse-maroon-zardozi.jpg';
import cottonSaree from '../assests/images/catalog/saree-handloom-cotton.jpg';
import sageKurta from '../assests/images/catalog/kurta-chikankari-sage.jpg';

import model1 from '../assests/images/banner/hero-model-1.png';
import model2 from '../assests/images/banner/hero-model-2.png';
import model3 from '../assests/images/banner/hero-model-3.png';
import model4 from '../assests/images/banner/hero-model-4.png';
import model5 from '../assests/images/banner/hero-model-5.png';
import model6 from '../assests/images/banner/hero-model-6.png';
import model7 from '../assests/images/banner/hero-model-7.png';
import model8 from '../assests/images/banner/hero-model-8.png';

export const CATEGORIES = [
  'All Categories',
  'Sarees',
  'Silk Sarees',
  'Cotton Sarees',
  'Linen Sarees',
  'Designer Sarees',
  'Kurtas & Sets',
  'Blouses',
  'Lehengas',
  'Dupattas',
];

export const COLORS = [
  { name: 'Maroon', hex: '#631322' },
  { name: 'Red', hex: '#B91C1C' },
  { name: 'Mustard', hex: '#D97706' },
  { name: 'Bottle Green', hex: '#14532D' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Ivory', hex: '#FDFBF7', border: true },
  { name: 'Black', hex: '#1F2937' },
  { name: 'Beige', hex: '#D7C4A5' },
  { name: 'Lavender', hex: '#C084FC' },
];

export const FABRICS = [
  'Kanjivaram Silk',
  'Banarasi Silk',
  'Tussar Silk',
  'Pure Cotton',
  'Handloom Linen',
  'Organza',
  'Chanderi',
  'Chiffon',
  'Georgette',
];

export const OCCASIONS = [
  'Wedding',
  'Festive',
  'Daily Wear',
  'Office Wear',
  'Party Wear',
  'Traditional Ceremony',
];

export const SIZES = [
  { label: 'Free Size', description: 'Standard Saree (5.5m) + Unstitched Blouse (0.8m)' },
  { label: 'XS', description: 'Bust: 32" | Waist: 26"' },
  { label: 'S', description: 'Bust: 34" | Waist: 28"' },
  { label: 'M', description: 'Bust: 36" | Waist: 30"' },
  { label: 'L', description: 'Bust: 38" | Waist: 32"' },
  { label: 'XL', description: 'Bust: 40" | Waist: 34"' },
  { label: 'XXL', description: 'Bust: 42" | Waist: 36"' },
];

/**
 * Returns exactly 4 curated high-resolution photography assets for any product & color variant:
 * Slot 1: Signature studio catalog flatlay
 * Slot 2: Model editorial drape (revealed on card hover / mobile swipe)
 * Slot 3: Detail close-up / alternate model angle
 * Slot 4: Lifestyle drape / pairing ensemble
 */
export function getProductImages(product, variant) {
  if (!product) return [];
  const activeVar = variant || (product.variants && product.variants[0]) || {};
  const color = activeVar.color || product.defaultColor || '';

  if (Array.isArray(activeVar.gallery) && activeVar.gallery.length === 4) {
    return activeVar.gallery;
  }

  const primary = activeVar.image || product.image || crimsonSaree;
  const secondary = activeVar.secondaryImage || product.secondaryImage || model1;

  // Curated color-matched 3rd & 4th shots
  let slot3 = model8;
  let slot4 = maroonBlouse;

  if (color === 'Ivory' || color === 'Beige') {
    slot3 = model4;
    slot4 = cottonSaree;
  } else if (color === 'Bottle Green') {
    slot3 = model6;
    slot4 = greenBanarasi;
  } else if (color === 'Mustard') {
    slot3 = model2;
    slot4 = mustardSaree;
  } else if (color === 'Navy Blue') {
    slot3 = model5;
    slot4 = navyTussar;
  } else if (color === 'Pink') {
    slot3 = model7;
    slot4 = pinkOrganza;
  } else if (product.category === 'Blouses') {
    slot3 = model8;
    slot4 = model1;
  } else if (product.category === 'Kurtas & Sets') {
    slot3 = model4;
    slot4 = sageKurta;
  }

  // Ensure 4 unique items
  const rawList = [primary, secondary, slot3, slot4];
  const list = [];
  rawList.forEach((img) => {
    if (img && !list.includes(img)) {
      list.push(img);
    }
  });

  const fallbacks = [model1, model3, model5, model7, crimsonSaree, ivorySaree, model8, model2];
  let fIdx = 0;
  while (list.length < 4 && fIdx < fallbacks.length) {
    if (!list.includes(fallbacks[fIdx])) {
      list.push(fallbacks[fIdx]);
    }
    fIdx++;
  }

  return list.slice(0, 4);
}

/**
 * Normalizes any product representation (from collectionData or products.js)
 * into a rich product entity compatible with QuickViewModal and cart actions.
 */
export function normalizeProduct(product) {
  if (!product) return null;

  // If already a rich COLLECTION_PRODUCT with variants
  if (Array.isArray(product.variants) && product.variants.length > 0 && product.name && product.price) {
    return product;
  }

  const name = product.name || product.n || '';
  const price = product.price || product.p || 2499;

  // Try to match against existing collection catalog
  const matched = COLLECTION_PRODUCTS.find(
    (cp) =>
      cp.id === product.id ||
      cp.name.toLowerCase() === name.toLowerCase() ||
      (name && cp.name.toLowerCase().includes(name.toLowerCase()))
  );

  if (matched) {
    return {
      ...matched,
      id: product.id,
      name: name || matched.name,
      price: price || matched.price,
      image: product.image || matched.image,
    };
  }

  // Construct rich fallback entity for items from general catalog (e.g. products.js)
  const isKalamkari = name.toLowerCase().includes('kalamkari') || product.a === 'kala';
  const isCotton = name.toLowerCase().includes('cotton') || product.a === 'cot';
  const isOrganza = name.toLowerCase().includes('organza');
  const isChanderi = name.toLowerCase().includes('chanderi');

  const fabric = isKalamkari
    ? 'Hand-Painted Kalamkari Silk'
    : isCotton
    ? 'Handloom Pure Cotton'
    : isOrganza
    ? 'Tissue Sheer Organza'
    : isChanderi
    ? 'Pure Chanderi Silk'
    : 'Pure Kanjivaram Silk';

  const category = isKalamkari
    ? 'Kalakaari'
    : isCotton
    ? 'Cotton Sarees'
    : isOrganza
    ? 'Designer Sarees'
    : 'Silk Sarees';

  let defaultColor = 'Maroon';
  let defaultHex = '#631322';
  if (name.toLowerCase().includes('ivory')) {
    defaultColor = 'Ivory';
    defaultHex = '#FDFBF7';
  } else if (name.toLowerCase().includes('indigo')) {
    defaultColor = 'Navy Blue';
    defaultHex = '#1E3A8A';
  } else if (name.toLowerCase().includes('rose') || name.toLowerCase().includes('pink')) {
    defaultColor = 'Pink';
    defaultHex = '#EC4899';
  } else if (name.toLowerCase().includes('green')) {
    defaultColor = 'Bottle Green';
    defaultHex = '#14532D';
  } else if (name.toLowerCase().includes('sandal') || name.toLowerCase().includes('beige')) {
    defaultColor = 'Beige';
    defaultHex = '#D7C4A5';
  }

  const primaryImg = product.image || crimsonSaree;
  const secondaryImg = model1;

  const variants = [
    {
      color: defaultColor,
      hex: defaultHex,
      image: primaryImg,
      secondaryImage: secondaryImg,
    },
  ];

  return {
    id: product.id,
    name: name || 'Artisanal Handloom Saree',
    sku: `VG-SR-${product.id}`,
    price,
    originalPrice: Math.round(price * 1.35),
    discount: '25% OFF',
    rating: 4.9,
    reviewsCount: 38,
    badge: isKalamkari ? 'Artisanal' : 'Bestseller',
    category,
    fabric,
    occasion: isKalamkari ? 'Traditional Ceremony' : 'Wedding / Festive',
    sizes: ['Free Size'],
    description:
      'Woven on traditional pit-looms by master handloom weavers in Tamil Nadu, this authentic heirloom saree features intricate zari borders, rich texture, and graceful drape.',
    careInstructions: 'Dry clean only. Store in pure cotton bag away from moisture.',
    blouseIncluded: 'Matching unstitched pure silk blouse piece (80 cm) included.',
    defaultColor,
    variants,
    image: primaryImg,
  };
}

export const COLLECTION_PRODUCTS = [
  {
    id: 'saree-1',
    name: 'Kanjivaram Pure Zari Silk Saree',
    sku: 'VG-KJV-01',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Kanjivaram Silk',
    occasion: 'Wedding',
    price: 3499,
    originalPrice: 4999,
    discount: '30% OFF',
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Handwoven',
    isNew: true,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Woven on traditional pit-looms by master weavers in Tamil Nadu, this bridal crimson Kanjivaram features pure gold zari korvai border with annapakshi and yazhi motifs, complemented by a lavish brocade pallu.',
    careInstructions: 'Dry clean only. Store in pure cotton bag away from moisture.',
    blouseIncluded: 'Matching unstitched pure silk blouse piece (80 cm) included.',
    defaultColor: 'Maroon',
    variants: [
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model1,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
    ],
  },
  {
    id: 'saree-2',
    name: 'Ivory Zari Temple Border Saree',
    sku: 'VG-KJV-02',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Kanjivaram Silk',
    occasion: 'Traditional Ceremony',
    price: 2899,
    originalPrice: 3899,
    discount: '25% OFF',
    rating: 4.8,
    reviewsCount: 42,
    badge: 'GI Tagged',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'An auspicious ivory and gold Kanjivaram handloom silk saree adorned with delicate peacock buttas across the body and an ornate antique gold zari temple gopuram border.',
    careInstructions: 'Dry clean only. Refold periodically to preserve zari sheen.',
    blouseIncluded: 'Contrasting golden tissue silk blouse piece (80 cm) included.',
    defaultColor: 'Ivory',
    variants: [
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model1,
      },
    ],
  },
  {
    id: 'saree-3',
    name: 'Emerald Floral Jaal Banarasi Saree',
    sku: 'VG-BNR-03',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Banarasi Silk',
    occasion: 'Wedding',
    price: 3999,
    originalPrice: 5499,
    discount: '27% OFF',
    rating: 5.0,
    reviewsCount: 56,
    badge: 'Bestseller',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Handcrafted in Varanasi on pure katan silk, this bottle green heirloom saree features an intricate kadwa gold zari floral jaal with handcrafted tassels at the pallu edges.',
    careInstructions: 'Strictly dry clean. Wrap in clean white muslin cloth.',
    blouseIncluded: 'Unstitched bottle green katan silk blouse piece with matching sleeve border.',
    defaultColor: 'Bottle Green',
    variants: [
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model8,
      },
    ],
  },
  {
    id: 'saree-4',
    name: 'Turmeric Temple Kanjivaram Silk',
    sku: 'VG-KJV-04',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Kanjivaram Silk',
    occasion: 'Festive',
    price: 3199,
    originalPrice: 4299,
    discount: '26% OFF',
    rating: 4.9,
    reviewsCount: 29,
    badge: 'Festive Edit',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Radiant festive turmeric mustard silk woven with auspicious geometric motifs, contrasted against a regal maroon temple border adorned with intricate chariot and kalash motifs.',
    careInstructions: 'Professional dry clean only.',
    blouseIncluded: 'Maroon silk blouse piece with matching gold temple borders.',
    defaultColor: 'Mustard',
    variants: [
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model1,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'saree-5',
    name: 'Scalloped Gota Patti Organza Saree',
    sku: 'VG-ORG-05',
    category: 'Designer Sarees',
    parentCategory: 'Sarees',
    fabric: 'Organza',
    occasion: 'Party Wear',
    price: 2599,
    originalPrice: 3499,
    discount: '26% OFF',
    rating: 4.7,
    reviewsCount: 31,
    badge: 'Trending',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Airy and weightless pure silk organza saree in dual pastel tones of blush pink and lavender, elevated with handcrafted silver pita zari scalloped borders and hand-embroidered floral bootis.',
    careInstructions: 'Steam iron with low temperature only. Dry clean.',
    blouseIncluded: 'Unstitched raw silk blouse piece in blush pink with scalloped neckline border.',
    defaultColor: 'Pink',
    variants: [
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model5,
      },
      {
        color: 'Lavender',
        hex: '#C084FC',
        image: pinkOrganza,
        secondaryImage: model4,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
    ],
  },
  {
    id: 'saree-6',
    name: 'Midnight Navy Blue Tussar Silk Saree',
    sku: 'VG-TSR-06',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Tussar Silk',
    occasion: 'Festive',
    price: 3499,
    originalPrice: 4699,
    discount: '25% OFF',
    rating: 4.8,
    reviewsCount: 24,
    badge: 'Pure Silk',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Natural textured wild Tussar silk in an opulent midnight indigo shade, woven with an antique bronze-gold zari border displaying mayil (peacock) and floral trellis motifs.',
    careInstructions: 'Dry clean only. Roll in muslin cloth.',
    blouseIncluded: 'Deep royal blue Tussar silk unstitched blouse fabric (80 cm).',
    defaultColor: 'Navy Blue',
    variants: [
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
      {
        color: 'Black',
        hex: '#1F2937',
        image: model8,
        secondaryImage: model1,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'saree-7',
    name: 'Terracotta Block Print Cotton Saree',
    sku: 'VG-COT-07',
    category: 'Cotton Sarees',
    parentCategory: 'Sarees',
    fabric: 'Pure Cotton',
    occasion: 'Daily Wear',
    price: 1599,
    originalPrice: 2199,
    discount: '27% OFF',
    rating: 4.7,
    reviewsCount: 65,
    badge: 'Eco-Friendly',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Breathable 100% fine count combed cotton saree hand-printed in natural earthy terracotta dyes using heritage wooden blocks in Bagru. Soft, structured, and ideal for all-day elegance.',
    careInstructions: 'Gentle hand wash in cold water with mild detergent. Dry in shade.',
    blouseIncluded: 'Contrasting printed cotton blouse piece (80 cm).',
    defaultColor: 'Beige',
    variants: [
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model2,
      },
    ],
  },
  {
    id: 'saree-8',
    name: 'Chikankari Kurta & Sage Dupatta Set',
    sku: 'VG-KRT-08',
    category: 'Kurtas & Sets',
    parentCategory: 'Kurtas & Sets',
    fabric: 'Chanderi',
    occasion: 'Office Wear',
    price: 2499,
    originalPrice: 3299,
    discount: '24% OFF',
    rating: 4.9,
    reviewsCount: 19,
    badge: 'Handcrafted',
    isNew: true,
    isBestseller: false,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'An exquisite Lucknowi Chikankari kurta set featuring delicate Bakhiya and Phanda needle embroidery on breathable ivory Chanderi silk, paired with an embroidered sage green dupatta.',
    careInstructions: 'Dry clean recommended or hand wash with mild care.',
    blouseIncluded: 'Complete 2-piece stitched ensemble (Kurta and Dupatta).',
    defaultColor: 'Ivory',
    variants: [
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: sageKurta,
        secondaryImage: model3,
      },
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model5,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
    ],
  },
  {
    id: 'saree-9',
    name: 'Maroon Zardozi Embroidered Silk Blouse',
    sku: 'VG-BLS-09',
    category: 'Blouses',
    parentCategory: 'Blouses',
    fabric: 'Kanjivaram Silk',
    occasion: 'Wedding',
    price: 1899,
    originalPrice: 2599,
    discount: '27% OFF',
    rating: 4.9,
    reviewsCount: 52,
    badge: 'Ready to Wear',
    isNew: false,
    isBestseller: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Handcrafted deep crimson raw silk padded blouse featuring royal paisley zardozi hand embroidery, cut-dana highlights, and traditional maggam work along the neck and sleeves.',
    careInstructions: 'Dry clean only to maintain embroidery threads and stones.',
    blouseIncluded: 'Stitched blouse with margin inside for easy 2-inch alteration.',
    defaultColor: 'Maroon',
    variants: [
      {
        color: 'Maroon',
        hex: '#631322',
        image: maroonBlouse,
        secondaryImage: model8,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
    ],
  },
  {
    id: 'saree-10',
    name: 'Hand-Painted Madder Kalamkari Silk',
    sku: 'VG-KLM-10',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Tussar Silk',
    occasion: 'Traditional Ceremony',
    price: 2199,
    originalPrice: 2999,
    discount: '27% OFF',
    rating: 4.8,
    reviewsCount: 39,
    badge: 'Artisanal',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Authentic Srikalahasti free-hand kalamkari drawing in organic alum and fermented jaggery dyes on pure handspun Tussar silk. Depicts celestial swans and blossoming lotus vines.',
    careInstructions: 'Dry clean only with reputable cleaners.',
    blouseIncluded: 'Matching hand-painted raw silk blouse length (80 cm).',
    defaultColor: 'Red',
    variants: [
      {
        color: 'Red',
        hex: '#B91C1C',
        image: model2,
        secondaryImage: crimsonSaree,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model7,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model1,
      },
    ],
  },
  {
    id: 'saree-11',
    name: 'Crimson Tussar Ghicha Handloom',
    sku: 'VG-GHC-11',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Tussar Silk',
    occasion: 'Festive',
    price: 3499,
    originalPrice: 4799,
    discount: '27% OFF',
    rating: 4.9,
    reviewsCount: 22,
    badge: 'Handloom',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Rich textured ghicha silk handwoven with rustic earthen slub charm and antique gold tissue border. The dramatic deep crimson tone exudes timeless royal grace.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Unstitched ghicha silk blouse piece included.',
    defaultColor: 'Red',
    variants: [
      {
        color: 'Red',
        hex: '#B91C1C',
        image: model3,
        secondaryImage: crimsonSaree,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model1,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
    ],
  },
  {
    id: 'saree-12',
    name: 'Peacock Motif Kalamkari Silk Saree',
    sku: 'VG-KLM-12',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Silk',
    occasion: 'Traditional Ceremony',
    price: 3199,
    originalPrice: 4299,
    discount: '26% OFF',
    rating: 4.9,
    reviewsCount: 45,
    badge: 'Masterpiece',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Masterwork hand-painted peacock and Tree of Life narrative across the grand pallu on smooth mulberry silk, framed by a lustrous antique zari border.',
    careInstructions: 'Dry clean only. Avoid spraying perfumes directly on fabric.',
    blouseIncluded: 'Contrasting silk blouse piece with hand-painted peacock sleeve cuffs.',
    defaultColor: 'Navy Blue',
    variants: [
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: model6,
        secondaryImage: navyTussar,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
    ],
  },
  {
    id: 'saree-13',
    name: 'Sandal Gold Chanderi Tissue Saree',
    sku: 'VG-CHD-13',
    category: 'Designer Sarees',
    parentCategory: 'Sarees',
    fabric: 'Chanderi',
    occasion: 'Festive',
    price: 1899,
    originalPrice: 2599,
    discount: '27% OFF',
    rating: 4.7,
    reviewsCount: 38,
    badge: 'Lightweight',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Woven with gossamer-fine silk warp and metallic zari weft in Madhya Pradesh, yielding a luminous translucent drape with delicate meenakari motifs.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Matching golden tissue chanderi unstitched blouse piece (80 cm).',
    defaultColor: 'Beige',
    variants: [
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: model7,
        secondaryImage: ivorySaree,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'saree-14',
    name: 'Maroon Temple Korvai Heirloom Saree',
    sku: 'VG-KRV-14',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Kanjivaram Silk',
    occasion: 'Wedding',
    price: 3899,
    originalPrice: 5299,
    discount: '26% OFF',
    rating: 5.0,
    reviewsCount: 71,
    badge: 'Pure Zari',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Authentic double-shuttle Korvai interlocking weaving technique joining a lustrous deep maroon body to monumental gold zari temple spires. An heirloom to treasure for generations.',
    careInstructions: 'Dry clean only. Air out every 6 months in shade.',
    blouseIncluded: 'Solid maroon heavy silk blouse fabric with gold border.',
    defaultColor: 'Maroon',
    variants: [
      {
        color: 'Maroon',
        hex: '#631322',
        image: model8,
        secondaryImage: crimsonSaree,
      },
      {
        color: 'Red',
        hex: '#B91C1C',
        image: crimsonSaree,
        secondaryImage: model2,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'saree-15',
    name: 'Handloom Soft Linen Daily Saree',
    sku: 'VG-LIN-15',
    category: 'Linen Sarees',
    parentCategory: 'Sarees',
    fabric: 'Handloom Linen',
    occasion: 'Office Wear',
    price: 1999,
    originalPrice: 2699,
    discount: '26% OFF',
    rating: 4.8,
    reviewsCount: 26,
    badge: 'Organic',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Pure 100-count organic European flax linen woven on traditional Bengal handlooms with sleek silver zari selvedges and breathable texture.',
    careInstructions: 'Gentle hand wash in cold water or dry clean.',
    blouseIncluded: 'Running linen blouse fabric with contrast selvedge.',
    defaultColor: 'Beige',
    variants: [
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
      {
        color: 'Lavender',
        hex: '#C084FC',
        image: pinkOrganza,
        secondaryImage: model3,
      },
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
    ],
  },
  {
    id: 'saree-16',
    name: 'Lavender Whisper Organza Festive Saree',
    sku: 'VG-ORG-16',
    category: 'Designer Sarees',
    parentCategory: 'Sarees',
    fabric: 'Organza',
    occasion: 'Party Wear',
    price: 2799,
    originalPrice: 3699,
    discount: '24% OFF',
    rating: 4.8,
    reviewsCount: 18,
    badge: 'New Arrival',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Modern dreamscape in ethereal lavender organza with delicate hand-beaded borders and hand-embroidered resham floral sprays.',
    careInstructions: 'Dry clean only. Steam press on reverse side.',
    blouseIncluded: 'Embroidered silk organza blouse fabric with scalloped sleeve trim.',
    defaultColor: 'Lavender',
    variants: [
      {
        color: 'Lavender',
        hex: '#C084FC',
        image: pinkOrganza,
        secondaryImage: model5,
      },
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model4,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
    ],
  },
  {
    id: 'saree-17',
    name: 'Royal Amber Katan Silk Banarasi',
    sku: 'VG-BNR-17',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Banarasi Silk',
    occasion: 'Wedding',
    price: 4299,
    originalPrice: 5999,
    discount: '28% OFF',
    rating: 4.9,
    reviewsCount: 34,
    badge: 'GI Tagged',
    isNew: true,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Pure Katan silk in a majestic turmeric amber tone, adorned with handwoven gold and silver sona-rupa zari florals and heavy brocade pallu.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Matching pure silk unstitched blouse piece (80 cm).',
    defaultColor: 'Mustard',
    variants: [
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model1,
      },
    ],
  },
  {
    id: 'saree-18',
    name: 'Lotus Pond Hand-Painted Kalamkari',
    sku: 'VG-KLM-18',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Tussar Silk',
    occasion: 'Traditional Ceremony',
    price: 2799,
    originalPrice: 3799,
    discount: '26% OFF',
    rating: 4.8,
    reviewsCount: 28,
    badge: 'Artisanal',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Depicting mythological lotus ponds and peacocks drawn with bamboo pens using natural indigo, pomegranate rind, and myrobalan extracts.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Hand-painted matching Tussar silk blouse piece.',
    defaultColor: 'Navy Blue',
    variants: [
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model2,
      },
      {
        color: 'Red',
        hex: '#B91C1C',
        image: crimsonSaree,
        secondaryImage: model3,
      },
    ],
  },
  {
    id: 'saree-19',
    name: 'Chanderi Gold Tissue Festive Saree',
    sku: 'VG-CHD-19',
    category: 'Designer Sarees',
    parentCategory: 'Sarees',
    fabric: 'Chanderi',
    occasion: 'Festive',
    price: 2399,
    originalPrice: 3199,
    discount: '25% OFF',
    rating: 4.7,
    reviewsCount: 16,
    badge: 'Lightweight',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Gleaming golden tissue woven with sheer silk warp and fine zari weft. Extremely lightweight with magnificent shimmer under ambient lighting.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Unstitched tissue blouse piece (80 cm).',
    defaultColor: 'Ivory',
    variants: [
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model5,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model7,
      },
    ],
  },
  {
    id: 'saree-20',
    name: 'Forest Green Zari Border Handloom Cotton',
    sku: 'VG-COT-20',
    category: 'Cotton Sarees',
    parentCategory: 'Sarees',
    fabric: 'Pure Cotton',
    occasion: 'Office Wear',
    price: 1699,
    originalPrice: 2299,
    discount: '26% OFF',
    rating: 4.9,
    reviewsCount: 41,
    badge: 'Eco-Friendly',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Finely spun 120s count pure cotton handloom saree with a sleek temple zari border in earthy bottle green and terracotta tones.',
    careInstructions: 'Hand wash with mild liquid detergent. Dry in shade.',
    blouseIncluded: 'Running cotton blouse piece with contrast border.',
    defaultColor: 'Bottle Green',
    variants: [
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
    ],
  },
  {
    id: 'saree-21',
    name: 'Midnight Floral Brocade Banarasi',
    sku: 'VG-BNR-21',
    category: 'Silk Sarees',
    parentCategory: 'Sarees',
    fabric: 'Banarasi Silk',
    occasion: 'Wedding',
    price: 3899,
    originalPrice: 5199,
    discount: '25% OFF',
    rating: 4.9,
    reviewsCount: 37,
    badge: 'Pure Silk',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Regal deep navy and gold brocade pure silk Banarasi with shikargah hunt motifs and intricate silver-gold meenakari detail.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Heavy brocade silk blouse length (80 cm).',
    defaultColor: 'Navy Blue',
    variants: [
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model8,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'saree-22',
    name: 'Sage Whisper Chikankari Kurta Set',
    sku: 'VG-KRT-22',
    category: 'Kurtas & Sets',
    parentCategory: 'Kurtas & Sets',
    fabric: 'Chanderi',
    occasion: 'Daily Wear',
    price: 2699,
    originalPrice: 3499,
    discount: '23% OFF',
    rating: 4.8,
    reviewsCount: 15,
    badge: 'Handcrafted',
    isNew: true,
    isBestseller: false,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Chanderi silk kurta with all-over shadow work Chikankari embroidery, paired with a matching embroidered organza dupatta and palazzo trousers.',
    careInstructions: 'Dry clean recommended.',
    blouseIncluded: 'Stitched 3-piece ensemble (Kurta, Dupatta, Palazzo).',
    defaultColor: 'Ivory',
    variants: [
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: sageKurta,
        secondaryImage: model3,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'saree-23',
    name: 'Emerald Maggam Zardozi Silk Blouse',
    sku: 'VG-BLS-23',
    category: 'Blouses',
    parentCategory: 'Blouses',
    fabric: 'Kanjivaram Silk',
    occasion: 'Wedding',
    price: 1999,
    originalPrice: 2699,
    discount: '26% OFF',
    rating: 5.0,
    reviewsCount: 44,
    badge: 'Ready to Wear',
    isNew: false,
    isBestseller: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Royal bottle green pure raw silk blouse embellished with gold zardozi bullion wires, seed pearls, and peacock medallion back embroidery.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Pre-stitched blouse with inner cotton lining and 2-inch margins.',
    defaultColor: 'Bottle Green',
    variants: [
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: maroonBlouse,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: maroonBlouse,
        secondaryImage: model8,
      },
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
    ],
  },
  {
    id: 'saree-24',
    name: 'Sunset Terracotta Linen Handloom',
    sku: 'VG-LIN-24',
    category: 'Linen Sarees',
    parentCategory: 'Sarees',
    fabric: 'Handloom Linen',
    occasion: 'Daily Wear',
    price: 1899,
    originalPrice: 2499,
    discount: '24% OFF',
    rating: 4.8,
    reviewsCount: 21,
    badge: 'Organic',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Earthy terracotta and warm natural beige organic linen saree woven with fine silver zari pinstripes and tasselled pallu.',
    careInstructions: 'Hand wash in cold water with mild detergent.',
    blouseIncluded: 'Unstitched plain linen blouse piece (80 cm).',
    defaultColor: 'Beige',
    variants: [
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model2,
      },
    ],
  },
];

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Default Sorting' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'rating', label: 'Customer Rating' },
];

export const KALAKAARI_CATEGORIES = [
  'All Kalamkari',
  'Pen Kalamkari',
  'Silk Kalamkari',
  'Tussar Kalamkari',
  'Cotton Kalamkari',
  'Chanderi Kalamkari',
  'Bridal Kalamkari',
  'Mythological Kalamkari',
];

export const KALAKAARI_FABRICS = [
  'Hand-Painted Kalamkari Silk',
  'Tussar Kalamkari Silk',
  'Pure Mulberry Silk',
  'Handloom Cotton Kalamkari',
  'Chanderi Kalamkari Silk',
  'Ghicha Kalamkari Silk',
  'Organza Kalamkari',
];

export const KALAKAARI_OCCASIONS = [
  'Traditional Ceremony',
  'Festive',
  'Wedding',
  'Artisan Soirée',
  'Daily Heritage',
];

export const KALAKAARI_PRODUCTS = [
  {
    id: 'kalakaari-1',
    name: 'Srikalahasti Madder Red Pen Kalamkari Silk',
    sku: 'VG-KLM-01',
    category: 'Pen Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Hand-Painted Kalamkari Silk',
    occasion: 'Traditional Ceremony',
    price: 3199,
    originalPrice: 4299,
    discount: '26% OFF',
    rating: 4.9,
    reviewsCount: 52,
    badge: 'Artisanal Pen Work',
    isNew: true,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Authentic Srikalahasti free-hand drawing in organic alum mordant and fermented jaggery dyes on pure handloom mulberry silk. Features the Tree of Life narrative with celestial swans and blossoming lotus vines.',
    careInstructions: 'Dry clean only. Air in shade; avoid direct harsh sunlight.',
    blouseIncluded: 'Matching unstitched pure silk blouse piece (80 cm) with hand-painted borders included.',
    defaultColor: 'Maroon',
    variants: [
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model3,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model7,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model2,
      },
    ],
  },
  {
    id: 'kalakaari-2',
    name: 'Celestial Peacock Motif Kalamkari Tussar',
    sku: 'VG-KLM-02',
    category: 'Tussar Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Tussar Kalamkari Silk',
    occasion: 'Festive',
    price: 3499,
    originalPrice: 4699,
    discount: '25% OFF',
    rating: 4.9,
    reviewsCount: 46,
    badge: 'Masterpiece',
    isNew: true,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Masterwork hand-painted dancing peacocks and verdant floral vines across the grand pallu on textured golden tussar silk, framed by a lustrous antique zari border.',
    careInstructions: 'Dry clean only. Refold periodically to preserve fabric grain.',
    blouseIncluded: 'Unstitched tussar silk blouse piece (80 cm) included.',
    defaultColor: 'Navy Blue',
    variants: [
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model3,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model1,
      },
    ],
  },
  {
    id: 'kalakaari-3',
    name: 'Lotus Pond Hand-Painted Kalamkari Silk',
    sku: 'VG-KLM-03',
    category: 'Silk Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Hand-Painted Kalamkari Silk',
    occasion: 'Artisan Soirée',
    price: 2899,
    originalPrice: 3899,
    discount: '26% OFF',
    rating: 4.8,
    reviewsCount: 38,
    badge: 'GI Tagged',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Freehand pen-drawn botanical narrative depicting serene lotus ponds, blooming padma blossoms, and miniature cranes on fluid mulberry silk.',
    careInstructions: 'Dry clean only. Store in muslin wrap.',
    blouseIncluded: 'Contrasting raw silk blouse length (80 cm) included.',
    defaultColor: 'Bottle Green',
    variants: [
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model2,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
    ],
  },
  {
    id: 'kalakaari-4',
    name: 'Earthen Ochre & Madder Kalamkari Handloom',
    sku: 'VG-KLM-04',
    category: 'Cotton Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Handloom Cotton Kalamkari',
    occasion: 'Daily Heritage',
    price: 1899,
    originalPrice: 2499,
    discount: '24% OFF',
    rating: 4.8,
    reviewsCount: 31,
    badge: '100% Organic Dyes',
    isNew: false,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Breathable handspun Mangalagiri cotton treated in buffalo milk and myrobalan baths, featuring traditional floral creepers hand-painted in rich earthen madder and turmeric ochre.',
    careInstructions: 'Gentle hand wash in cold water with mild reetha or soapnut detergent.',
    blouseIncluded: 'Matching handloom cotton unstitched blouse piece (80 cm).',
    defaultColor: 'Mustard',
    variants: [
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model1,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
    ],
  },
  {
    id: 'kalakaari-5',
    name: 'Mythological Ramayana Narrative Kalamkari Silk',
    sku: 'VG-KLM-05',
    category: 'Mythological Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Pure Mulberry Silk',
    occasion: 'Wedding',
    price: 4499,
    originalPrice: 5999,
    discount: '25% OFF',
    rating: 5.0,
    reviewsCount: 64,
    badge: 'Heritage Heirloom',
    isNew: true,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Temple narrative epic hand-painted by national awardee master artisans, depicting poetic episodes with delicate fine-line bamboo pen work, bordered in antique zari.',
    careInstructions: 'Professional dry cleaning only.',
    blouseIncluded: 'Hand-painted pure silk unstitched blouse piece (80 cm).',
    defaultColor: 'Maroon',
    variants: [
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model8,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model6,
      },
    ],
  },
  {
    id: 'kalakaari-6',
    name: 'Deep Indigo & Ivory Floral Kalamkari Chanderi',
    sku: 'VG-KLM-06',
    category: 'Chanderi Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Chanderi Kalamkari Silk',
    occasion: 'Festive',
    price: 2499,
    originalPrice: 3299,
    discount: '24% OFF',
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Natural Indigo',
    isNew: false,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Gossamer sheer Chanderi silk with hand-drawn Persian gul-o-bulbul vines in pure extracted plant indigo, completed with a lightweight golden tissue pallu.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Chanderi silk matching blouse length (80 cm).',
    defaultColor: 'Navy Blue',
    variants: [
      {
        color: 'Navy Blue',
        hex: '#1E3A8A',
        image: navyTussar,
        secondaryImage: model4,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'kalakaari-7',
    name: 'Sunset Terracotta Ghicha Kalamkari Saree',
    sku: 'VG-KLM-07',
    category: 'Tussar Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Ghicha Kalamkari Silk',
    occasion: 'Traditional Ceremony',
    price: 3299,
    originalPrice: 4499,
    discount: '27% OFF',
    rating: 4.9,
    reviewsCount: 35,
    badge: 'Handspun',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Rustic slub-textured Ghicha silk with earthy madder root dye drawings of the Tree of Life and birds of paradise, woven with fine temple borders.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Unstitched ghicha silk blouse piece included.',
    defaultColor: 'Beige',
    variants: [
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model3,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model2,
      },
    ],
  },
  {
    id: 'kalakaari-8',
    name: 'Bridal Vermilion Zari Border Kalamkari Silk',
    sku: 'VG-KLM-08',
    category: 'Bridal Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Hand-Painted Kalamkari Silk',
    occasion: 'Wedding',
    price: 4899,
    originalPrice: 6499,
    discount: '25% OFF',
    rating: 5.0,
    reviewsCount: 71,
    badge: 'Royal Bridal',
    isNew: true,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Opulent bridal vermilion silk featuring intricate kalamkari medallions across the body and a dramatic grand pallu with real gold zari korvai weaving.',
    careInstructions: 'Dry clean only. Store in acid-free tissue.',
    blouseIncluded: 'Hand-embroidered pure silk blouse piece (85 cm) included.',
    defaultColor: 'Red',
    variants: [
      {
        color: 'Red',
        hex: '#B91C1C',
        image: crimsonSaree,
        secondaryImage: model1,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: maroonBlouse,
        secondaryImage: model8,
      },
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
    ],
  },
  {
    id: 'kalakaari-9',
    name: 'Forest Emerald Hamsa Kalamkari Silk',
    sku: 'VG-KLM-09',
    category: 'Silk Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Hand-Painted Kalamkari Silk',
    occasion: 'Festive',
    price: 2999,
    originalPrice: 3999,
    discount: '25% OFF',
    rating: 4.8,
    reviewsCount: 42,
    badge: 'Artisanal',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Deep emerald green silk with hand-painted mythological swans (Hamsa) and sacred kadamba blossoms in natural pomegranate rind and iron mordants.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Contrasting gold brocade blouse piece included.',
    defaultColor: 'Bottle Green',
    variants: [
      {
        color: 'Bottle Green',
        hex: '#14532D',
        image: greenBanarasi,
        secondaryImage: model5,
      },
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model2,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model7,
      },
    ],
  },
  {
    id: 'kalakaari-10',
    name: 'Antique Sandalwood Pen Kalamkari Organza',
    sku: 'VG-KLM-10',
    category: 'Silk Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Organza Kalamkari',
    occasion: 'Artisan Soirée',
    price: 3699,
    originalPrice: 4999,
    discount: '26% OFF',
    rating: 4.9,
    reviewsCount: 33,
    badge: 'Sheer Luxury',
    isNew: true,
    isBestseller: false,
    sizes: ['Free Size'],
    description:
      'Weightless sheer organza featuring freehand pen kalamkari floral creepers and scalloped antique zari embroidered borders for a modern poetic drape.',
    careInstructions: 'Dry clean only. Do not wring.',
    blouseIncluded: 'Unstitched satin silk blouse piece (80 cm).',
    defaultColor: 'Pink',
    variants: [
      {
        color: 'Pink',
        hex: '#EC4899',
        image: pinkOrganza,
        secondaryImage: model5,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model3,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model4,
      },
    ],
  },
  {
    id: 'kalakaari-11',
    name: 'Charcoal Black & Gold Tree of Life Kalamkari',
    sku: 'VG-KLM-11',
    category: 'Tussar Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Tussar Kalamkari Silk',
    occasion: 'Festive',
    price: 3399,
    originalPrice: 4599,
    discount: '26% OFF',
    rating: 4.9,
    reviewsCount: 48,
    badge: 'Exclusive Edit',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Fermented iron-jaggery black dye depicting the cosmic Kalpavriksha (Tree of Life) framed by shimmering molten gold brocade border on raw Tussar silk.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Raw silk unstitched blouse piece (80 cm) included.',
    defaultColor: 'Black',
    variants: [
      {
        color: 'Black',
        hex: '#1F2937',
        image: navyTussar,
        secondaryImage: model6,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model8,
      },
      {
        color: 'Ivory',
        hex: '#FDFBF7',
        image: ivorySaree,
        secondaryImage: model1,
      },
    ],
  },
  {
    id: 'kalakaari-12',
    name: 'Royal Mustard & Madder Kalamkari Brocade',
    sku: 'VG-KLM-12',
    category: 'Silk Kalamkari',
    parentCategory: 'Sarees',
    fabric: 'Hand-Painted Kalamkari Silk',
    occasion: 'Traditional Ceremony',
    price: 2799,
    originalPrice: 3699,
    discount: '24% OFF',
    rating: 4.8,
    reviewsCount: 39,
    badge: 'Bestseller',
    isNew: false,
    isBestseller: true,
    sizes: ['Free Size'],
    description:
      'Vibrant turmeric and madder handloom silk with intricate paisleys and dancing damsels drawn by master kalamkari artisans in Srikalahasti.',
    careInstructions: 'Dry clean only.',
    blouseIncluded: 'Matching handloom silk blouse piece (80 cm).',
    defaultColor: 'Mustard',
    variants: [
      {
        color: 'Mustard',
        hex: '#D97706',
        image: mustardSaree,
        secondaryImage: model7,
      },
      {
        color: 'Maroon',
        hex: '#631322',
        image: crimsonSaree,
        secondaryImage: model3,
      },
      {
        color: 'Beige',
        hex: '#D7C4A5',
        image: cottonSaree,
        secondaryImage: model2,
      },
    ],
  },
];

