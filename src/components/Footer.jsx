import React, { useState, useEffect, useRef } from 'react';
import { Arrow } from './Icons';
import logoVaagai from '../assests/images/Logo-Vaagai.jpeg';

const SOCIAL_PROFILES = [
  {
    name: 'Instagram',
    ariaLabel: 'VAAGAI on Instagram',
    url: '#',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    ariaLabel: 'VAAGAI on Facebook',
    url: '#',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    ariaLabel: 'VAAGAI on Pinterest',
    url: '#',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-3.66 19.31c-.04-.84-.07-2.13.04-3.05.1-.84.66-5.59.66-5.59s-.17-.34-.17-.83c0-.78.45-1.36 1.02-1.36.48 0 .71.36.71.79 0 .48-.31 1.21-.47 1.88-.13.56.28 1.02.83 1.02 1 0 1.77-1.05 1.77-2.57 0-1.34-.97-2.28-2.35-2.28-1.72 0-2.73 1.29-2.73 2.62 0 .52.2 1.07.45 1.38a.36.36 0 0 1 .08.35c-.09.37-.29 1.18-.33 1.35-.05.21-.17.26-.39.16-1.44-.67-2.34-2.77-2.34-4.46 0-3.63 2.64-6.97 7.61-6.97 3.99 0 7.1 2.85 7.1 6.65 0 3.97-2.5 7.16-5.97 7.16-1.17 0-2.26-.61-2.64-1.32l-.72 2.74c-.26 1-.96 2.25-1.43 3.01A10 10 0 1 0 12 2z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    ariaLabel: 'VAAGAI on YouTube',
    url: '#',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
      </svg>
    ),
  },
];

const MODAL_DATA = {
  contact: {
    title: 'Customer Concierge',
    subtitle: 'Personalized Assistance & Styling',
    badge: 'Direct Client Care',
    items: [
      { label: 'Client Concierge Email', value: 'concierge@vaagai.com' },
      { label: 'Styling & WhatsApp Hotline', value: '+91 98765 43210' },
      { label: 'Concierge Hours', value: 'Monday – Saturday: 10:00 AM – 7:00 PM IST' },
      { label: 'Flagship Atelier', value: 'Road No. 10, Banjara Hills, Hyderabad, Telangana 500034, India' },
    ],
    note: 'For private bridal drapes or custom zari monogramming, please reserve an atelier consultation 48 hours in advance.',
  },
  'track-order': {
    title: 'Track Your Order',
    subtitle: 'Real-Time Heritage Dispatch Updates',
    badge: 'Shipment Tracking',
    items: [
      { label: 'Dispatch Notification', value: 'An SMS and email containing your AWB tracking link is dispatched within 24 hours of artisanal inspection.' },
      { label: 'Courier Partners', value: 'Blue Dart Luxury, DHL Express, and Sequel Secure Logistics.' },
      { label: 'Need Urgent Status?', value: 'Email tracking@vaagai.com with your 6-digit Order ID.' },
    ],
    note: 'All shipments are 100% transit-insured and sealed with our tamper-evident wax medallion.',
  },
  'saree-care': {
    title: 'Artisanal Saree Care',
    subtitle: 'Preserving Heirloom Weaves for Generations',
    badge: 'Master Weaver Guide',
    items: [
      { label: 'Pure Mulberry & Kanjivaram Silk', value: 'Dry clean only with heritage garment care specialists. Never wash or soak in water.' },
      { label: 'Hand-Painted Kalamkari & Natural Dyes', value: 'Avoid direct sunlight when airing. Dry in shaded, breezy spaces to protect organic botanical pigments.' },
      { label: 'Storage', value: 'Wrap individual sarees in breathable unbleached muslin cloth. Avoid plastic covers to let the silk breathe.' },
      { label: 'Crease Management', value: 'Periodically refold every 3–4 months along alternate lines to protect delicate zari wefts.' },
    ],
    note: 'Iron on the reverse side using low-medium heat with a protective pure cotton pressing cloth.',
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything You Need to Know',
    badge: 'Client Guide',
    items: [
      { label: 'Are all sarees 100% authentic handloom?', value: 'Yes. Every drape is certified with the Silk Mark and woven by master artisans in traditional weaving clusters.' },
      { label: 'Does the saree include a matching blouse piece?', value: 'Yes, all our sarees include an 80 cm unstitched matching pure silk blouse piece unless specifically noted otherwise.' },
      { label: 'Do you offer worldwide shipping?', value: 'Yes, we provide insured international express courier delivery across the US, UK, UAE, Singapore, Australia, and worldwide.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Your Data Protection & Confidentiality',
    badge: 'Legal & Trust',
    items: [
      { label: 'Client Confidentiality', value: 'We never rent, sell, or disclose your personal details or measurements to third parties.' },
      { label: 'Payment Security', value: 'All transactions are encrypted via 256-bit SSL certified payment gateways.' },
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    subtitle: 'Insured White-Glove Transit',
    badge: 'Delivery Standards',
    items: [
      { label: 'Domestic Delivery (India)', value: 'Complimentary insured shipping via Blue Dart Express. Delivery within 3–5 business days.' },
      { label: 'International Delivery', value: 'DHL Express worldwide courier delivery within 5–7 business days.' },
    ],
  },
  returns: {
    title: 'Returns & Exchange',
    subtitle: '7-Day Handloom Heritage Guarantee',
    badge: 'Client Assurance',
    items: [
      { label: 'Hassle-Free Returns', value: 'We accept returns of unworn, unaltered sarees in original packaging within 7 days of delivery.' },
      { label: 'Custom Tailored Items', value: 'Blouses that have undergone custom bespoke stitching cannot be returned.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'VAAGAI Atelier Client Agreement',
    badge: 'Client Terms',
    items: [
      { label: 'Authentic Handloom Variations', value: 'As each piece is individually hand-woven, subtle variations in texture and zari selvedges are natural hallmarks of authentic handloom craftsmanship.' },
    ],
  },
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeModalKey, setActiveModalKey] = useState(null);
  const modalRef = useRef(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const openModal = (key, e) => {
    if (e) e.preventDefault();
    setActiveModalKey(key);
  };

  const activeModalData = activeModalKey ? MODAL_DATA[activeModalKey] : null;

  return (
    <footer
      aria-label="VAAGAI Global Footer"
      className="bg-[#1C1514] text-ivory border-t border-gold/25 relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-burgundy/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Newsletter Header Banner */}
      <div className="border-b border-gold/20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="cap-sm text-gold tracking-couture block mb-2">
            The VAAGAI Dispatch · Private Gazette
          </span>
          <h3 className="font-serif text-3xl sm:text-5xl text-ivory font-normal">
            Invitations to Archival Drops
          </h3>
          <p className="font-serif italic text-base text-ivory/70 max-w-lg mx-auto mt-2">
            Receive private access to new pit-loom releases, wedding trousseau edits, and master weaver lore.
          </p>

          <form onSubmit={handleSubscribe} className="mt-8 max-w-md mx-auto flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-burgundy/30 border border-gold/30 rounded-full px-5 py-3 text-sm font-sans text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="btn-gold text-xs px-6 py-3 shrink-0"
            >
              {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>

          {isSubscribed && (
            <p className="font-serif italic text-sm text-gold mt-3">
              Thank you for subscribing. A welcome curation has been reserved for your inbox.
            </p>
          )}
        </div>
      </div>

      {/* Main 4-Column Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Col 1 & 2: Brand Narrative & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={logoVaagai}
                alt="VAAGAI Emblem"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-gold/80 shadow-md bg-burgundy shrink-0"
              />
              <div className="flex flex-col leading-none">
                <span className="font-serif text-2xl tracking-[0.2em] uppercase text-ivory">
                  VAAGAI
                </span>
                <span className="font-sans text-[8px] sm:text-[9px] tracking-couture text-gold uppercase mt-1">
                  South Indian Heritage
                </span>
              </div>
            </div>
            <p className="font-serif italic text-sm text-ivory/75 max-w-sm leading-relaxed">
              South Indian heritage and couture drapery. Handcrafted with pure mulberry silk, sacred natural pigments, and 24K gold zari on traditional pit-looms.
            </p>
            <div className="pt-2 flex items-center gap-3">
              {SOCIAL_PROFILES.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  aria-label={p.ariaLabel}
                  className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition"
                >
                  {p.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Collections */}
          <div>
            <h4 className="cap-sm text-gold tracking-couture block mb-4 border-b border-gold/15 pb-2">
              Collections
            </h4>
            <ul className="space-y-2.5 font-serif text-sm text-ivory/70">
              <li><a href="#collection?fabric=Kanjivaram+Silk" className="hover:text-gold transition">Kanjivaram Silk</a></li>
              <li><a href="#kalakaari" className="hover:text-gold transition">Kalamkari Sarees</a></li>
              <li><a href="#collection?fabric=Banarasi+Silk" className="hover:text-gold transition">Banarasi Brocades</a></li>
              <li><a href="#collection?fabric=Pure+Cotton" className="hover:text-gold transition">Handloom Cotton</a></li>
              <li><a href="#new-arrivals" className="hover:text-gold transition">The Runway Lookbook</a></li>
              <li><a href="#collection" className="hover:text-gold transition">All Sarees Catalog</a></li>
            </ul>
          </div>

          {/* Col 4: Client Concierge */}
          <div>
            <h4 className="cap-sm text-gold tracking-couture block mb-4 border-b border-gold/15 pb-2">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 font-serif text-sm text-ivory/70">
              <li><button type="button" onClick={(e) => openModal('contact', e)} className="hover:text-gold transition text-left">Customer Concierge</button></li>
              <li><button type="button" onClick={(e) => openModal('track-order', e)} className="hover:text-gold transition text-left">Track Your Order</button></li>
              <li><button type="button" onClick={(e) => openModal('saree-care', e)} className="hover:text-gold transition text-left">Artisanal Saree Care</button></li>
              <li><button type="button" onClick={(e) => openModal('faq', e)} className="hover:text-gold transition text-left">Frequently Asked Questions</button></li>
              <li><button type="button" onClick={(e) => openModal('shipping', e)} className="hover:text-gold transition text-left">Shipping Policy</button></li>
              <li><button type="button" onClick={(e) => openModal('returns', e)} className="hover:text-gold transition text-left">Returns &amp; Exchanges</button></li>
            </ul>
          </div>

          {/* Col 5: Flagship Atelier */}
          <div>
            <h4 className="cap-sm text-gold tracking-couture block mb-4 border-b border-gold/15 pb-2">
              The Atelier
            </h4>
            <div className="font-serif text-sm text-ivory/70 space-y-3">
              <p className="leading-snug">
                Road No. 10, Banjara Hills, Hyderabad, Telangana 500034, India
              </p>
              <p className="font-sans text-xs text-gold">
                Hotline: +91 98765 43210
              </p>
              <p className="font-sans text-xs text-ivory/80">
                Email: concierge@vaagai.com
              </p>
              <p className="font-serif italic text-xs text-ivory/50">
                Mon–Sat: 10:00 AM – 7:00 PM IST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Policy Links */}
      <div className="border-t border-gold/15 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-ivory/50">
          <p>© {new Date().getFullYear()} VAAGAI Luxury Sarees &amp; Ethnic Wear. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={(e) => openModal('privacy', e)} className="hover:text-gold transition">Privacy Policy</button>
            <button type="button" onClick={(e) => openModal('terms', e)} className="hover:text-gold transition">Terms of Service</button>
            <button type="button" onClick={(e) => openModal('shipping', e)} className="hover:text-gold transition">Delivery Standards</button>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('vaagai:open-tracking'))} className="text-gold/80 hover:text-gold transition font-medium">Track Order</button>
          </div>
        </div>
      </div>

      {/* Interactive Modal for Policies & Concierge */}
      {activeModalData && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setActiveModalKey(null)}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl bg-[#29201E] border border-gold/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-ivory"
          >
            <div className="flex items-start justify-between pb-4 border-b border-gold/25">
              <div>
                <span className="cap-sm text-gold block mb-1">
                  {activeModalData.badge}
                </span>
                <h3 className="font-serif text-2xl text-ivory font-medium">
                  {activeModalData.title}
                </h3>
                <p className="font-serif italic text-xs text-ivory/70 mt-0.5">
                  {activeModalData.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {activeModalData.items.map((it) => (
                <div key={it.label} className="p-3.5 rounded-xl bg-burgundy/30 border border-gold/20">
                  <span className="cap-sm text-gold block text-[10px]">
                    {it.label}
                  </span>
                  <p className="font-serif text-sm text-ivory/90 mt-1 leading-relaxed">
                    {it.value}
                  </p>
                </div>
              ))}

              {activeModalData.note && (
                <p className="font-serif italic text-xs text-gold/80 pt-2 border-t border-gold/15 leading-relaxed">
                  ✦ {activeModalData.note}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gold/20 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                className="btn-gold text-xs py-2 px-5"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
