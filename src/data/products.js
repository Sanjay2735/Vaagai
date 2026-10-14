import img1 from '../assests/images/banner/hero-model-1.png';
import img2 from '../assests/images/banner/hero-model-2.png';
import img3 from '../assests/images/banner/hero-model-3.png';
import img4 from '../assests/images/banner/hero-model-4.png';
import img5 from '../assests/images/banner/hero-model-5.png';
import img6 from '../assests/images/banner/hero-model-6.png';
import img7 from '../assests/images/banner/hero-model-7.png';
import img8 from '../assests/images/banner/hero-model-8.png';

export const PRODUCTS = [
  { id: 1, n: 'Ivory Zari Kanjivaram', p: 2899, a: 'cream', b: 'silk', image: img1 },
  { id: 2, n: 'Madder Red Kalamkari', p: 2199, a: 'kala', b: 't1', image: img2 },
  { id: 3, n: 'Crimson Tussar Silk', p: 3499, a: 't2', b: 'cream', image: img3 },
  { id: 4, n: 'Indigo Hand-Block Cotton', p: 1599, a: 'cot', b: 't3', image: img4 },
  { id: 5, n: 'Rose Gold Organza', p: 2599, a: 'silk', b: 'women', image: img5 },
  { id: 6, n: 'Peacock Kalamkari Silk', p: 3199, a: 't3', b: 'kala', image: img6 },
  { id: 7, n: 'Sandal Chanderi', p: 1899, a: 'women', b: 'win', image: img7 },
  { id: 8, n: 'Maroon Temple Border', p: 3899, a: 't1', b: 'hero', image: img8 },
];

export const formatINR = (num) => '₹' + num.toLocaleString('en-IN');

