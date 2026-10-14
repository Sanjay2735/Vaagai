import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import bgImage from './assests/images/banner/e4cacd4d-d4a3-49e9-b91e-1fcdb4f18ada.png';
import bannerImage from './assests/images/banner/banner-1.png';

const Shop = createContext();

export const TONES = {
  hero: 'linear-gradient(160deg, #380710 0%, #681220 32%, #8D1C2E 65%, #4F0B17 100%)',
  cream: 'linear-gradient(180deg, #f3e6c8, #d9b97a)',
  women: 'linear-gradient(150deg, #e9d7ae, #b88a3e 60%, #5b3a1c)',
  kala: 'linear-gradient(150deg, #5A0E1C 0%, #851C2C 50%, #3D0811 100%)',
  banner: 'linear-gradient(150deg, #5A0E1C 0%, #851C2C 50%, #3D0811 100%)',
  silk: 'linear-gradient(150deg, #5c1a3a, #b6446b 60%, #e8a8a0)',
  cot: 'linear-gradient(150deg, #3a0a14, #a3333f 60%, #ecd9a8)',
  win: 'linear-gradient(120deg, #f7ecd0 0%, #e7c98a 40%, #9a5b2a 100%)',
  t1: 'linear-gradient(170deg, #7d2a14, #e5a24a)',
  t2: 'linear-gradient(170deg, #3a0a14, #d4af37)',
  t3: 'linear-gradient(170deg, #3b1f4a, #d98b8b)',
};

export const PRODUCTS = [
  { id: 1, n: 'Ivory Zari Kanjivaram', p: 2899, a: 'cream', b: 'silk' },
  { id: 2, n: 'Madder Red Kalamkari', p: 2199, a: 'kala', b: 't1' },
  { id: 3, n: 'Crimson Tussar Silk', p: 3499, a: 't2', b: 'cream' },
  { id: 4, n: 'Indigo Hand-Block Cotton', p: 1599, a: 'cot', b: 't3' },
  { id: 5, n: 'Rose Gold Organza', p: 2599, a: 'silk', b: 'women' },
  { id: 6, n: 'Peacock Kalamkari Silk', p: 3199, a: 't3', b: 'kala' },
  { id: 7, n: 'Sandal Chanderi', p: 1899, a: 'women', b: 'win' },
  { id: 8, n: 'Maroon Temple Border', p: 3899, a: 't1', b: 'hero' },
];

const inr = (n) => '₹' + n.toLocaleString('en-IN');

function Img({ t, label, className = '', children }) {
  return (
    <div className={'relative overflow-hidden ' + className}>
      <div className="zi absolute inset-0" style={{ background: TONES[t] || t }} />
      <div className="leaf absolute -inset-4 mix-blend-multiply opacity-70" />
      {label && (
        <span className="cap absolute bottom-3 left-4 text-ivory/70" style={{ fontSize: 9 }}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

function Reveal({ children, dir = '', delay = 0, className = '' }) {
  const r = useRef();
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && r.current) {
          r.current.classList.add('in');
          o.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (r.current) o.observe(r.current);
    return () => o.disconnect();
  }, []);
  return (
    <div
      ref={r}
      className={`rv ${dir === 'l' ? 'rv-l' : dir === 'r' ? 'rv-r' : ''} ${className}`}
      style={{ transitionDelay: delay + 'ms' }}
    >
      {children}
    </div>
  );
}

function Parallax({ children, speed = 0.15, className = '' }) {
  const r = useRef();
  useEffect(() => {
    const f = () => {
      if (r.current) r.current.style.transform = `translateY(${window.scrollY * speed}px) scale(1.12)`;
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [speed]);
  return (
    <div ref={r} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

const Arrow = () => (
  <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor">
    <path d="M0 5h20M16 1l4 4-4 4" />
  </svg>
);

const Ico = ({ d, s = 20 }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const I = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  heart: (
    <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" />
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  x: <path d="M5 5l14 14M19 5 5 19" />,
  craft: <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8z" />,
  gem: (
    <>
      <path d="M6 4h12l4 6-10 11L2 10z" />
      <path d="M2 10h20M9 4l3 17 3-17" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h12v10H2zM14 10h4l4 3v3h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  love: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5" />
    </>
  ),
};

function Nav() {
  const { cart, wish, openCart } = useContext(Shop);
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const f = () => setIsScrolled(window.scrollY > 20);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  const isSolid = isScrolled || isHovered;

  const L = (h, t) => (
    <a href={h} onClick={() => setOpen(false)} className="cap ul text-ivory hover:text-gold transition">
      {t}
    </a>
  );

  const logo = (
    <a href="#/" className="flex flex-col items-center gap-1">
      <span className="w-11 h-11 rounded-full border border-gold flex items-center justify-center font-primary text-2xl text-gold">
        V
      </span>
      <span className="cap text-gold" style={{ fontSize: 9 }}>
        Vaagai
      </span>
    </a>
  );

  const count = cart.reduce((a, c) => a + c.q, 0);

  const icons = (
    <>
      <button aria-label="Search" className="hover:text-gold">
        <Ico d={I.search} />
      </button>
      <button aria-label="Wishlist" className="hidden md:block relative hover:text-gold">
        <Ico d={I.heart} />
        {wish.length > 0 && (
          <b className="absolute -top-2 -right-2 text-[9px] bg-gold text-forest rounded-full w-4 h-4 grid place-items-center">
            {wish.length}
          </b>
        )}
      </button>
      <button aria-label="Cart" onClick={openCart} className="relative hover:text-gold">
        <Ico d={I.bag} />
        {count > 0 && (
          <b className="absolute -top-2 -right-2 text-[9px] bg-gold text-forest rounded-full w-4 h-4 grid place-items-center">
            {count}
          </b>
        )}
      </button>
    </>
  );

  return (
    <>
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-0 inset-x-0 z-40 py-3.5 transition-all duration-500 ease-out"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 14px)' }}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ease-in-out pointer-events-none ${isSolid ? 'opacity-100' : 'opacity-0'
            } bg-forest/95 backdrop-blur-md shadow-lg shadow-black/25`}
        />
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-3 items-center">
          <nav className="hidden md:flex gap-8">
            {L('#/', 'Home')}
            {L('#women-new', 'Women')}
            {L('#kalakaari', 'Kalakaari')}
          </nav>
          <button
            className="md:hidden justify-self-start"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Ico d={I.menu} s={24} />
          </button>
          <div className="justify-self-center">{logo}</div>
          <div className="justify-self-end flex items-center gap-6">
            <nav className="hidden lg:flex gap-8">
              {L('#new', 'New Arrivals')}
              {L('#best', 'Best Sellers')}
              {L('#story', 'Our Story')}
            </nav>
            {icons}
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 z-50 md:hidden transition ${open ? 'visible' : 'invisible'}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-4/5 max-w-xs bg-forest border-r border-gold/40 p-8 flex flex-col gap-7 transition-transform duration-500 ${open ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <button onClick={() => setOpen(false)} className="self-end text-gold">
            <Ico d={I.x} s={24} />
          </button>
          {L('#/', 'Home')}
          {L('#women-new', 'Women')}
          {L('#kalakaari', 'Kalakaari')}
          {L('#new', 'New Arrivals')}
          {L('#best', 'Best Sellers')}
          {L('#story', 'Our Story')}
          <div className="mt-auto flex gap-6 text-gold">
            <Ico d={I.heart} />
            <Ico d={I.search} />
          </div>
        </aside>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[660px] md:min-h-[720px] lg:h-[90vh] max-h-[920px] overflow-hidden flex items-center bg-[#280408]">
      {/* Royal Palace Interior Background Image */}
      <img
        src={bgImage}
        alt="Royal Heritage Palace Setting"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
      />

      {/* Atmospheric ambient lighting & subtle vignette for contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/35 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#280408]/25 to-[#1a0205]/70 pointer-events-none" />

      {/* Ambient warm glow halo directly behind the models */}
      <div className="absolute right-4 sm:right-12 md:right-20 bottom-12 w-[440px] sm:w-[560px] lg:w-[680px] h-[440px] sm:h-[560px] lg:h-[680px] bg-rose-700/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Right Models Cutout: prominent scale, strictly maintaining height bounds and headroom below header */}
      <div className="absolute right-0 bottom-0 w-full md:w-[60%] lg:w-[56%] xl:w-[53%] h-[56vh] sm:h-[64vh] md:h-[75%] lg:h-[78%] max-h-[580px] lg:max-h-[640px] flex items-end justify-center md:justify-end pr-0 sm:pr-2 md:pr-4 lg:pr-8 xl:pr-12 pointer-events-none z-10">
        <img
          src={bannerImage}
          alt="Vaagai Culture - Heritage Sarees"
          className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] filter brightness-[1.02] contrast-[1.03] transition-transform duration-700 hover:scale-[1.02]"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 md:h-28 bg-gradient-to-t from-forest via-forest/50 to-transparent z-20 pointer-events-none" />

      {/* Left Content Section */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 md:px-12 w-full z-30 pt-24 pb-14 md:py-20">
        <div className="max-w-lg lg:max-w-xl">
          <span className="cap glass-pill px-4 py-1.5 rounded-full text-gold font-medium mb-5 inline-block shadow-[0_0_15px_rgba(212,175,55,0.2)] text-[10px] tracking-widest fu">
            Tradition Meets Tomorrow
          </span>

          <div className="relative inline-block mb-3 fu" style={{ animationDelay: '0.2s' }}>
            <h1 className="font-primary text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.1em] text-[#FBF4E4] font-light leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
              CULTURE
            </h1>

            <svg
              className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[440px] h-9 -mt-2 text-gold opacity-90 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              viewBox="0 0 420 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M310 4 C270 24, 180 32, 60 22 C40 20, 20 16, 5 10"
                stroke="url(#swashGold2)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M260 22 C190 32, 120 28, 80 20"
                stroke="url(#swashGold2)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle cx="180" cy="28" r="2.5" fill="#E8C872" />
              <defs>
                <linearGradient id="swashGold2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#AA7A1E" stopOpacity="0.2" />
                  <stop offset="40%" stopColor="#E8C872" stopOpacity="1" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex items-center gap-3 mt-1.5 text-gold/75">
              <i className="h-px w-14 bg-gradient-to-r from-transparent to-gold/70" />
              <span className="text-[10px] text-gold">✦</span>
              <i className="h-px w-14 bg-gradient-to-l from-transparent to-gold/70" />
            </div>
          </div>

          <p
            className="font-primary italic text-lg sm:text-xl md:text-2xl text-ivory/90 mb-8 max-w-md leading-relaxed fu"
            style={{ animationDelay: '0.4s' }}
          >
            A story in every drape — royal silk and exquisite craftsmanship woven for you.
          </p>

          <div className="fu flex flex-wrap items-center gap-4" style={{ animationDelay: '0.6s' }}>
            <a
              href="#explore"
              className="inline-flex items-center gap-3 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-[#38bdf8] text-[#1c0408] font-primary font-bold text-xs tracking-[0.16em] uppercase shadow-[0_0_24px_rgba(56,189,248,0.55),0_0_42px_rgba(56,189,248,0.25)] hover:bg-[#7dd3fc] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Explore Collection
              <span className="transform transition-transform group-hover:translate-x-1">
                <Arrow />
              </span>
            </a>
            <a
              href="#best"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass-pill text-ivory/90 hover:text-gold hover:border-gold font-primary text-xs tracking-wider uppercase transition-all duration-300"
            >
              View Best Sellers
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const Divider = ({ className = '' }) => (
  <div className={`gold-divider flex items-center gap-4 justify-center my-6 ${className}`}>
    <span className="gold-line gold-line-l h-px bg-gradient-to-r from-transparent via-[#E8C872] to-[#AA7A1E]" />
    <span className="gold-diamond w-1.5 h-1.5 rotate-45 bg-gradient-to-br from-[#FFE7A3] to-[#AA7A1E] shadow-[0_0_10px_rgba(212,175,55,0.6)] flex-shrink-0" />
    <span className="gold-line gold-line-r h-px bg-gradient-to-l from-transparent via-[#E8C872] to-[#AA7A1E]" />
  </div>
);

function NewCollections() {
  return (
    <section id="new" className="relative py-28 px-6 text-center overflow-hidden">
      <div className="leaf absolute -inset-10 opacity-60" />
      <Reveal className="relative">
        <p className="cap text-gold">New Collections</p>
        <h2 className="font-primary text-5xl md:text-7xl mt-4">For Women</h2>
        <Divider />
        <p className="font-primary italic text-xl md:text-2xl text-ivory/85 max-w-xl mx-auto">
          Woven in light, draped in grace — the season’s finest, curated for you.
        </p>
      </Reveal>
    </section>
  );
}

function Explore() {
  const Card = ({ t, title, className }) => (
    <a href="#kalakaari" className={`zoom group relative block ${className}`}>
      <Img t={t} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
        <span className="cap">{title}</span>
        <span className="w-10 h-10 rounded-full border border-gold grid place-items-center text-gold group-hover:bg-gold group-hover:text-forest transition">
          <Arrow />
        </span>
      </div>
    </a>
  );
  return (
    <section id="explore" className="max-w-7xl mx-auto px-6 pb-24">
      <Reveal className="text-center mb-12">
        <p className="cap text-gold">Explore The Collection</p>
      </Reveal>
      <div className="grid md:grid-cols-5 gap-5">
        <Reveal dir="l" className="md:col-span-3">
          <div className="zoom relative min-h-[460px] md:min-h-[620px] h-full">
            <Img t="women" className="absolute inset-0" label="Women" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="cap text-gold">Women</p>
              <h3 className="font-primary text-4xl md:text-6xl mt-3 max-w-md leading-tight">
                Elegance in every drape, for you.
              </h3>
              <a href="#women-new" className="btn cap mt-6">
                Explore <Arrow />
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal dir="r" className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-5 h-full">
            <Card t="kala" title="Kalamkari Sarees" className="min-h-[240px]" />
            <Card t="silk" title="Silk Sarees" className="min-h-[240px]" />
            <Card t="cot" title="Cotton Sarees" className="min-h-[240px] hidden md:block" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Artistry() {
  return (
    <section
      id="story"
      className="relative overflow-hidden my-16 mx-4 md:mx-8 rounded-3xl border border-gold/20 shadow-[0_15px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(79,11,23,0.5)] glass-forest py-20 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="cap glass-pill px-4 py-1.5 rounded-full text-gold font-medium shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            Rooted in Indian Artistry
          </span>
          <Divider />
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <Reveal dir="l">
            <div className="zoom relative aspect-[4/5] overflow-hidden rounded-2xl glass-card border border-gold/20 shadow-lg shadow-black/30">
              <Img t="win" className="absolute inset-0 w-full h-full" label="Floral Kalamkari saree · seated by window" />
            </div>
          </Reveal>
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {['t1', 't2', 't3'].map((t, i) => (
              <Reveal key={t} delay={i * 150}>
                <div
                  className="zoom relative aspect-[1/2.4] overflow-hidden rounded-2xl glass-card border border-gold/20 shadow-lg shadow-black/30"
                  style={{ marginTop: i === 1 ? 40 : 0 }}
                >
                  <Img t={t} className="absolute inset-0 w-full h-full" label="Kalamkari print" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="text-center mt-16">
          <p className="font-primary italic text-3xl md:text-5xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            A canvas of tradition, for today’s world.
          </p>
          <a
            href="#kalakaari"
            className="btn cap mt-8 group rounded-full px-8 py-4 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)]"
          >
            Explore Kalakaari{' '}
            <span className="transform transition-transform group-hover:translate-x-1">
              <Arrow />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Trust() {
  const T = [
    ['craft', 'Authentic Craftsmanship'],
    ['gem', 'Premium Quality'],
    ['truck', 'Safe & Reliable Shipping'],
    ['love', 'Loved by Thousands'],
  ];
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {T.map(([i, t], k) => (
          <Reveal key={t} delay={k * 100}>
            <div className="glass-card flex flex-col items-center gap-4 text-center p-6 rounded-2xl group cursor-default">
              <span className="text-gold p-3.5 rounded-full bg-gold/10 border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] group-hover:border-gold transition-all duration-300">
                <Ico d={I[i]} s={28} />
              </span>
              <span className="cap tracking-wider group-hover:text-gold transition-colors duration-300" style={{ fontSize: 10 }}>
                {t}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Product({ p }) {
  const { wish, toggleWish, add } = useContext(Shop);
  const w = wish.includes(p.id);
  return (
    <Reveal>
      <div className="glass-card group rounded-2xl p-2.5 transition-all duration-500 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(212,175,55,0.22)]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
          <div
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
            style={{ background: TONES[p.a] }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: TONES[p.b] }}
          />
          <div className="leaf absolute -inset-4 mix-blend-multiply opacity-60" />
          <button
            onClick={() => toggleWish(p.id)}
            aria-label="Wishlist"
            className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-forest/60 border border-gold/25 grid place-items-center backdrop-blur-md shadow-md transition-all duration-300 ${w
                ? 'text-gold border-gold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'text-ivory hover:text-gold hover:border-gold/60'
              }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={w ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.3"
            >
              {I.heart}
            </svg>
          </button>
          <button
            onClick={() => add(p)}
            className="cap absolute bottom-0 inset-x-0 bg-gold/95 backdrop-blur-sm text-forest py-3 font-medium translate-y-full group-hover:translate-y-0 max-md:translate-y-0 transition-transform duration-500 hover:bg-gold shadow-[0_-4px_15px_rgba(212,175,55,0.3)]"
            style={{ fontSize: 10 }}
          >
            Quick Add +
          </button>
        </div>
        <div className="px-1.5 pb-1">
          <h3 className="font-primary text-xl mt-3 font-normal leading-snug">{p.n}</h3>
          <p className="cap text-gold mt-1 font-medium tracking-wider" style={{ fontSize: 11 }}>
            {inr(p.p)}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

const Grid = ({ list, title, id }) => (
  <section id={id} className="max-w-7xl mx-auto px-6 py-20">
    <Reveal className="text-center mb-12">
      <p className="cap text-gold">{title}</p>
      <Divider />
    </Reveal>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
      {list.map((p) => (
        <Product key={p.id} p={p} />
      ))}
    </div>
  </section>
);

function KalaBanner() {
  return (
    <section className="relative min-h-[420px] overflow-hidden my-10">
      <Parallax speed={0.08} className="absolute inset-0">
        <Img t="banner" className="w-full h-full" />
      </Parallax>
      <div className="absolute inset-0 bg-forest/70" />
      <Reveal className="relative text-center py-28 px-6">
        <p className="cap text-gold">Kalakaari Collection</p>
        <h2 className="font-primary italic text-5xl md:text-7xl mt-4">Hand-painted heritage</h2>
        <a href="#kalakaari" className="btn cap mt-8">
          Shop Kalakaari <Arrow />
        </a>
      </Reveal>
    </section>
  );
}

function PageHead({ t, s }) {
  return (
    <section className="pt-40 pb-6 text-center px-6">
      <p className="cap text-gold">{s}</p>
      <h1 className="font-primary text-6xl md:text-8xl mt-3 fu">{t}</h1>
      <Divider />
    </section>
  );
}

function Footer() {
  const [ok, setOk] = useState(false);
  const col = (h, l) => (
    <div>
      <h4 className="cap text-gold mb-5">{h}</h4>
      <ul className="space-y-3 text-sm text-ivory/75 font-light">
        {l.map((x) => (
          <li key={x}>
            <a href="#/" className="ul hover:text-gold">
              {x}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="border-t border-gold/60 mt-16 pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full border border-gold grid place-items-center font-primary text-2xl text-gold">
              V
            </span>
            <span className="cap text-gold">Vaagai</span>
          </div>
          <p className="mt-6 text-sm font-light text-ivory/75 max-w-sm leading-relaxed">
            Premium Indian ethnic wear — sarees and Kalamkari — woven by master artisans and made for
            the modern woman.
          </p>
          <p className="font-primary italic text-2xl mt-6 text-gold">Tradition Lives Beautifully</p>
        </div>
        {col('Shop', ['Women', 'Kalakaari', 'New Arrivals', 'Best Sellers'])}
        {col('Customer Care', ['Contact Us', 'Track Order', 'Saree Care', 'FAQs'])}
        <div>{col('Policies', ['Shipping', 'Returns', 'Privacy', 'Terms'])}</div>
      </div>
      <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-gold/30 flex flex-col md:flex-row gap-6 justify-between items-center">
        {ok ? (
          <p className="font-primary italic text-gold text-lg">Thank you — welcome to the family.</p>
        ) : (
          <div className="flex w-full md:w-auto border-b border-gold">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              className="cap bg-transparent outline-none py-3 flex-1 md:w-72 placeholder:text-ivory/40"
            />
            <button onClick={() => setOk(true)} className="text-gold">
              <Arrow />
            </button>
          </div>
        )}
        <div className="flex gap-5 cap text-ivory/70">
          {['IG', 'FB', 'PIN', 'YT'].map((s) => (
            <a key={s} href="#/" className="hover:text-gold" style={{ fontSize: 10 }}>
              {s}
            </a>
          ))}
        </div>
      </div>
      <p className="text-center cap text-ivory/40 mt-10" style={{ fontSize: 9 }}>
        © 2026 Vaagai
      </p>
    </footer>
  );
}

function CartDrawer({ open, close }) {
  const { cart, setQty, rm } = useContext(Shop);
  const tot = cart.reduce((a, c) => a + c.p * c.q, 0);
  return (
    <div className={`fixed inset-0 z-[60] ${open ? 'visible' : 'invisible'}`}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-forest border-l border-gold/40 flex flex-col transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gold/30">
          <h3 className="font-primary text-3xl">Your Bag</h3>
          <button onClick={close} className="text-gold">
            <Ico d={I.x} s={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 && (
            <p className="font-primary italic text-xl text-ivory/70 text-center mt-16">
              Your bag is empty.
            </p>
          )}
          {cart.map((c) => (
            <div key={c.id} className="flex gap-4">
              <div className="w-20 h-28 shrink-0" style={{ background: TONES[c.a] }} />
              <div className="flex-1">
                <h4 className="font-primary text-lg leading-tight">{c.n}</h4>
                <p className="cap text-gold mt-1" style={{ fontSize: 11 }}>
                  {inr(c.p)}
                </p>
                <div className="flex items-center gap-3 mt-3 text-gold">
                  <button onClick={() => setQty(c.id, c.q - 1)} className="w-7 h-7 border border-gold/60">
                    −
                  </button>
                  <span className="text-ivory">{c.q}</span>
                  <button onClick={() => setQty(c.id, c.q + 1)} className="w-7 h-7 border border-gold/60">
                    +
                  </button>
                  <button
                    onClick={() => rm(c.id)}
                    className="cap ml-auto text-ivory/50 hover:text-gold"
                    style={{ fontSize: 9 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-gold/30">
          <div className="flex justify-between cap mb-5">
            <span>Subtotal</span>
            <span className="text-gold">{inr(tot)}</span>
          </div>
          <button className="btn cap w-full justify-center" disabled={!cart.length}>
            Checkout <Arrow />
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function VaagaiApp() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [cart, setCart] = useState([]);
  const [wish, setWish] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);

  useEffect(() => {
    if (['#/', '', '#women-new', '#kalakaari'].includes(route)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [route]);

  const ctx = {
    cart,
    wish,
    openCart: () => setOpen(true),
    add: (p) => {
      setCart((c) =>
        c.find((x) => x.id === p.id) ? c.map((x) => (x.id === p.id ? { ...x, q: x.q + 1 } : x)) : [...c, { ...p, q: 1 }]
      );
      setOpen(true);
    },
    setQty: (id, q) =>
      setCart((c) =>
        q < 1
          ? c.filter((x) => x.id !== id)
          : c.map((x) =>
            x.id === id ? { ...x, q } : x
          )
      ),

    rm: (id) =>
      setCart((c) => c.filter((x) => x.id !== id)),

    toggleWish: (id) =>
      setWish((w) =>
        w.includes(id)
          ? w.filter((x) => x !== id)
          : [...w, id]
      ),
  };
  const kala = PRODUCTS.filter((p) => ['kala', 't1', 't3'].includes(p.a));

  let page;
  if (route === '#women-new') {
    page = (
      <>
        <PageHead t="Women" s="New Collection" />
        <Grid list={PRODUCTS} title="All Sarees" />
      </>
    );
  } else if (route === '#kalakaari') {
    page = (
      <>
        <PageHead t="Kalakaari" s="Hand-Painted Heritage" />
        <Grid list={kala} title="Kalamkari Edit" />
      </>
    );
  } else {
    page = (
      <>
        <Hero />
        <NewCollections />
        <Explore />
        <Trust />
        <Grid id="best" list={PRODUCTS.slice(0, 4)} title="Best Sellers" />
      </>
    );
  }

  return (
    <Shop.Provider value={ctx}>
      <Nav />
      <main key={route}>{page}</main>
      <Footer />
      <CartDrawer open={open} close={() => setOpen(false)} />
    </Shop.Provider>
  );
}
