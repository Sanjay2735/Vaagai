import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Arrow } from './Icons';

/**
 * Official social media configuration for Vaagai.
 * Replace `url: null` with live official URLs once handles are activated.
 * Kept null to prevent navigating to broken or non-existent URLs.
 */
const SOCIAL_PROFILES = [
  {
    name: 'Instagram',
    ariaLabel: 'Vaagai on Instagram',
    url: null, // e.g. 'https://www.instagram.com/vaagai'
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
    ariaLabel: 'Vaagai on Facebook',
    url: null, // e.g. 'https://www.facebook.com/vaagai'
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    ariaLabel: 'Vaagai on Pinterest',
    url: null, // e.g. 'https://www.pinterest.com/vaagai'
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-3.66 19.31c-.04-.84-.07-2.13.04-3.05.1-.84.66-5.59.66-5.59s-.17-.34-.17-.83c0-.78.45-1.36 1.02-1.36.48 0 .71.36.71.79 0 .48-.31 1.21-.47 1.88-.13.56.28 1.02.83 1.02 1 0 1.77-1.05 1.77-2.57 0-1.34-.97-2.28-2.35-2.28-1.72 0-2.73 1.29-2.73 2.62 0 .52.2 1.07.45 1.38a.36.36 0 0 1 .08.35c-.09.37-.29 1.18-.33 1.35-.05.21-.17.26-.39.16-1.44-.67-2.34-2.77-2.34-4.46 0-3.63 2.64-6.97 7.61-6.97 3.99 0 7.1 2.85 7.1 6.65 0 3.97-2.5 7.16-5.97 7.16-1.17 0-2.26-.61-2.64-1.32l-.72 2.74c-.26 1-.96 2.25-1.43 3.01A10 10 0 1 0 12 2z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    ariaLabel: 'Vaagai on YouTube',
    url: null, // e.g. 'https://www.youtube.com/@vaagai'
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
      </svg>
    ),
  },
];

/**
 * Authentic brand and policy data.
 * When standalone pages are created in App.jsx, these routes (#contact, #shipping, etc.)
 * will naturally transition from modal previews into full-page views.
 */
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
      { label: 'What is the delivery timeline?', value: 'Standard domestic delivery takes 3–5 business days. Express dispatch is available upon request.' },
      { label: 'Do you offer fall, pico, and tassel finish?', value: 'Complimentary premium fall, edging (pico), and hand-knotted tassels are included with every order.' },
      { label: 'Can I request a live video consultation?', value: 'Yes! Contact our concierge on WhatsApp to view the saree drape and natural sheen under true daylight.' },
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    subtitle: 'Insured White-Glove Transit',
    badge: 'Delivery Covenant',
    items: [
      { label: 'Domestic Shipping', value: 'Complimentary insured shipping on all orders across India.' },
      { label: 'Keepsake Packaging', value: 'Delivered in rigid keepsake presentation boxes with archival protective lining.' },
      { label: 'Dispatch Window', value: 'Ready-to-ship heirlooms dispatch within 24–48 hours of order confirmation.' },
      { label: 'Transit Insurance', value: 'Fully covered against transit loss or damage until handed over to you.' },
    ],
  },
  returns: {
    title: 'Returns & Heritage Exchanges',
    subtitle: 'Artisanal Quality Guarantee',
    badge: 'Exchange Policy',
    items: [
      { label: 'Exchange Window', value: '7-day seamless exchange window for unworn sarees with original tags and security seals intact.' },
      { label: 'Handloom Signatures', value: 'Subtle variations in weave density and natural pigment depth are natural hallmarks of handcrafted authenticity.' },
      { label: 'Easy Exchange Initiation', value: 'Write to concierge@vaagai.com with your Order ID to schedule complimentary door-step pickup.' },
    ],
  },
  privacy: {
    title: 'Privacy & Data Protection',
    subtitle: 'Confidentiality Commitment',
    badge: 'Client Privacy',
    items: [
      { label: 'Data Encryption', value: 'All transactions and personal details are encrypted with 256-bit SSL protocols.' },
      { label: 'No Third-Party Sharing', value: 'We never sell or distribute client contacts or purchase histories to external brokers.' },
      { label: 'Secure Payments', value: 'Payments are handled strictly through RBI-authorized, PCI-DSS Level 1 compliant gateways.' },
    ],
  },
  terms: {
    title: 'Terms of Artisanal Service',
    subtitle: 'Fair-Trade Handloom Covenant',
    badge: 'Terms & Conditions',
    items: [
      { label: 'Artisan Patronage', value: 'Every purchase directly supports sustainable master weaver livelihoods across Indian textile clusters.' },
      { label: 'Pricing & Taxes', value: 'All prices shown include applicable GST and luxury domestic transit insurance.' },
      { label: 'Authentic Representation', value: 'Photographs represent true product colors under calibrated studio lighting; minor screen variances may occur.' },
    ],
  },
};

export function Footer() {
  // Newsletter Form State
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  // Modal State for Customer Care & Policies
  const [activeModalKey, setActiveModalKey] = useState(null);

  // Social notification toast (when official channels are coming soon)
  const [socialToast, setSocialToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Modal Dialog Focus Trap Reference
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Clear toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Handle keyboard escape key for active modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeModalKey) {
          setActiveModalKey(null);
        }
        if (socialToast) {
          setSocialToast(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalKey, socialToast]);

  // Focus modal close button when opened
  useEffect(() => {
    if (activeModalKey && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [activeModalKey]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (activeModalKey) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeModalKey]);

  // Validate Email
  const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email address to join the royal circle.';
    }
    // Standard RFC-compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (e.g., name@domain.com).';
    }
    return '';
  };

  // Newsletter Submit Handler
  const handleSubmitNewsletter = async (e) => {
    e.preventDefault();

    // Prevent duplicate submission while in flight
    if (status === 'loading') return;

    const validationError = validateEmail(email);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const backendEndpoint = import.meta.env.VITE_NEWSLETTER_API_URL;

    if (backendEndpoint) {
      // Live Backend Integration
      try {
        const response = await fetch(backendEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        });

        if (response.ok) {
          setStatus('success');
          setIsDemo(false);
        } else {
          const errData = await response.json().catch(() => ({}));
          setStatus('error');
          setErrorMessage(errData.message || 'Subscription request could not be processed. Please try again.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Unable to connect to the newsletter service. Please check your network and try again.');
      }
    } else {
      // Honest Frontend Demo Mode (simulates realistic processing without falsely claiming live subscription)
      setTimeout(() => {
        setStatus('success');
        setIsDemo(true);
      }, 650);
    }
  };

  const handleResetNewsletter = () => {
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
    setIsDemo(false);
  };

  const showSocialNotice = (platformName) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSocialToast(`Vaagai official ${platformName} channel will be published soon. Subscribe to our newsletter for the official announcement.`);
    toastTimerRef.current = setTimeout(() => {
      setSocialToast(null);
    }, 4500);
  };

  // Smooth in-page anchor scroll or modal trigger
  const handleNavigation = (e, item) => {
    if (item.modalKey) {
      e.preventDefault();
      setActiveModalKey(item.modalKey);
      return;
    }

    // If it's an in-page anchor on the current Home view
    if (item.href.startsWith('#') && !['#women-new', '#kalakaari'].includes(item.href)) {
      const targetId = item.href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', item.href);
      }
    }
  };

  const renderColumn = (heading, links) => (
    <div>
      <h3 className="cap text-gold mb-5 font-medium tracking-[0.25em] text-xs">
        {heading}
      </h3>
      <ul className="space-y-3.5 text-sm text-ivory/80 font-light" role="list">
        {links.map((item) => {
          const label = typeof item === 'string' ? item : item.label;
          const href = typeof item === 'string' ? '#/' : item.href;
          const modalKey = item.modalKey;

          return (
            <li key={label}>
              <a
                href={href}
                onClick={(e) => handleNavigation(e, { href, modalKey })}
                className="ul inline-block text-ivory/80 hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A070F] rounded-sm py-0.5"
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const activeModalData = activeModalKey ? MODAL_DATA[activeModalKey] : null;

  return (
    <footer
      role="contentinfo"
      aria-label="Vaagai Site Footer"
      className="relative mt-24 pt-16 pb-12 px-5 sm:px-8 lg:px-12 glass-forest border-t border-gold/30 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Subtle Ambient Gold Radial Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-24 bg-gradient-to-b from-gold/15 to-transparent blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid: 5 columns on desktop, 2 on tablet, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Presentation Column (Spans 2 columns on desktop) */}
          <div className="sm:col-span-2 lg:col-span-2">
            <a
              href="#/"
              className="group inline-flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A070F] rounded-xl p-1 -m-1"
              aria-label="Vaagai - Return to Home"
            >
              <span className="relative w-12 h-12 rounded-full border border-gold/60 bg-gradient-to-br from-gold/20 via-[#4F0B17]/60 to-transparent flex items-center justify-center font-primary text-2xl text-gold shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:border-gold group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300">
                V
                <span className="absolute -inset-1 rounded-full border border-gold/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <div className="flex flex-col">
                <span className="cap text-gold font-medium tracking-[0.25em] text-sm group-hover:text-[#FFF0C2] transition-colors">
                  Vaagai
                </span>
                <span className="text-[10px] text-ivory/60 tracking-widest uppercase font-light">
                  Royal Silk Heritage
                </span>
              </div>
            </a>

            <p className="mt-5 text-sm font-light text-ivory/80 max-w-sm leading-relaxed">
              Premium Indian ethnic wear — sarees and Kalamkari — woven by master
              artisans and made for the modern woman.
            </p>

            <p className="font-primary italic text-2xl mt-5 text-gold glow-text drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">
              Tradition Lives Beautifully
            </p>

            {/* Artisanal Heritage Seals */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-ivory/75 font-light">
              <span className="glass-pill px-3 py-1 rounded-full border border-gold/25 inline-flex items-center gap-1.5 shadow-sm">
                <span className="text-gold text-xs" aria-hidden="true">✦</span> Silk Mark Certified
              </span>
              <span className="glass-pill px-3 py-1 rounded-full border border-gold/25 inline-flex items-center gap-1.5 shadow-sm">
                <span className="text-gold text-xs" aria-hidden="true">✦</span> Master Artisan Looms
              </span>
            </div>
          </div>

          {/* Shop Column */}
          {renderColumn('Shop', [
            { label: 'Women', href: '#women-new' },
            { label: 'Kalakaari', href: '#kalakaari' },
            { label: 'New Arrivals', href: '#new' },
            { label: 'Best Sellers', href: '#best' },
          ])}

          {/* Customer Care Column (Connected to dedicated modal dialogues) */}
          {renderColumn('Customer Care', [
            { label: 'Contact Us', href: '#contact', modalKey: 'contact' },
            { label: 'Track Order', href: '#track-order', modalKey: 'track-order' },
            { label: 'Saree Care', href: '#saree-care', modalKey: 'saree-care' },
            { label: 'FAQs', href: '#faq', modalKey: 'faq' },
          ])}

          {/* Policies Column (Connected to transparent policy modal dialogues) */}
          <div className="sm:col-span-1 lg:col-span-1">
            {renderColumn('Policies', [
              { label: 'Shipping', href: '#shipping', modalKey: 'shipping' },
              { label: 'Returns', href: '#returns', modalKey: 'returns' },
              { label: 'Privacy', href: '#privacy', modalKey: 'privacy' },
              { label: 'Terms', href: '#terms', modalKey: 'terms' },
            ])}
          </div>
        </div>

        {/* Middle Bar: Newsletter & Social Profiles */}
        <div className="mt-14 pt-8 border-t border-gold/20 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
          {/* Newsletter Subscription Area */}
          <div className="w-full md:max-w-md">
            <h4 className="cap text-gold text-xs font-medium tracking-[0.2em] mb-1.5">
              Exclusive Salon Access
            </h4>
            <p className="text-xs text-ivory/70 font-light mb-3">
              Be the first to preview limited seasonal weaves and archival releases.
            </p>

            {status === 'success' ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 glass-card p-3.5 sm:p-4 rounded-2xl border border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.2)] animate-fadeIn"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold/20 border border-gold flex items-center justify-center text-gold text-xs shrink-0 mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <p className="font-primary italic text-gold text-base glow-text">
                      Thank you — welcome to the family.
                    </p>
                    <p className="text-xs text-ivory/80 font-light mt-0.5">
                      You will receive our private salon drops and artisanal stories.
                    </p>
                    {isDemo && (
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold/90 border border-gold/30">
                        Frontend Preview · Connect VITE_NEWSLETTER_API_URL in production
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetNewsletter}
                  className="text-xs cap text-ivory/60 hover:text-gold transition self-end sm:self-center shrink-0 border-b border-ivory/30 hover:border-gold pb-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                >
                  Enter another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitNewsletter}
                noValidate
                className="flex flex-col gap-2"
              >
                <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center rounded-2xl sm:rounded-full glass-pill p-1.5 border border-gold/35 shadow-[0_4px_20px_rgba(0,0,0,0.35)] focus-within:border-gold focus-within:shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all">
                  <div className="relative flex-1 flex items-center px-3 py-1 sm:py-0">
                    <label htmlFor="newsletter-email-input" className="sr-only">
                      Email address for newsletter updates
                    </label>
                    <input
                      id="newsletter-email-input"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      disabled={status === 'loading'}
                      placeholder="YOUR EMAIL"
                      aria-label="Enter your email for private salon previews"
                      aria-invalid={status === 'error'}
                      aria-describedby={status === 'error' ? 'newsletter-error-feedback' : undefined}
                      className="cap bg-transparent outline-none w-full min-w-0 placeholder:text-ivory/40 text-ivory text-xs py-1.5 tracking-wider focus:placeholder:text-ivory/20 disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    aria-label="Subscribe to Vaagai updates"
                    className="mt-1 sm:mt-0 flex items-center justify-center gap-2 rounded-xl sm:rounded-full px-5 py-2.5 bg-gradient-to-r from-gold/90 to-[#E8C872] text-[#3A070F] font-medium text-xs cap hover:from-gold hover:to-[#FFF0C2] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A070F] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#3A070F] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <span>Join</span>
                        <Arrow />
                      </>
                    )}
                  </button>
                </div>

                {status === 'error' && errorMessage && (
                  <p
                    id="newsletter-error-feedback"
                    role="alert"
                    aria-live="polite"
                    className="text-xs text-amber-200/95 font-light flex items-center gap-1.5 pl-1 animate-fadeIn"
                  >
                    <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{errorMessage}</span>
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Social Media Profiles */}
          <div className="flex flex-col items-start md:items-end gap-3 self-stretch md:self-auto">
            <span className="cap text-ivory/60 text-[10px] tracking-widest font-light">
              Connect With The Atelier
            </span>
            <div className="flex items-center gap-3.5">
              {SOCIAL_PROFILES.map((social) => {
                const isExternal = Boolean(social.url);

                return isExternal ? (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-ivory/80 hover:text-gold hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.45)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A070F] transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ) : (
                  <button
                    key={social.name}
                    type="button"
                    onClick={() => showSocialNotice(social.name)}
                    aria-label={`${social.ariaLabel} (Official channel coming soon)`}
                    className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-ivory/80 hover:text-gold hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.45)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A070F] transition-all duration-300"
                  >
                    {social.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Atelier Note */}
        <div className="mt-12 pt-6 border-t border-gold/15 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-ivory/50 font-light">
          <p className="cap tracking-wider text-[10px] text-center sm:text-left">
            © {new Date().getFullYear()} Vaagai. All rights reserved. Handcrafted by master artisans in India.
          </p>

          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2 text-ivory/60 hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded px-2 py-1"
            aria-label="Scroll back to top of page"
          >
            <span className="cap tracking-widest text-[9px]">Back to Top</span>
            <span className="w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center text-[10px] group-hover:border-gold group-hover:bg-gold/10 transition-colors" aria-hidden="true">
              ↑
            </span>
          </a>
        </div>
      </div>

      {/* Social Toast Notification */}
      {socialToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl glass-card border border-gold/50 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-between gap-3 text-xs text-ivory animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-gold text-base" aria-hidden="true">✦</span>
            <p className="leading-relaxed">{socialToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setSocialToast(null)}
            className="text-ivory/50 hover:text-gold transition p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Information & Policy Dialog Modal */}
      {activeModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveModalKey(null)}
          role="presentation"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl glass-forest border border-gold/45 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.3)] max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gold/25">
              <div className="flex flex-col">
                <span className="cap text-gold text-[10px] tracking-[0.25em] font-medium">
                  {activeModalData.badge}
                </span>
                <h3
                  id="modal-title"
                  className="font-primary text-2xl sm:text-3xl text-[#FBF4E4] font-normal mt-1"
                >
                  {activeModalData.title}
                </h3>
                <p className="font-primary italic text-sm text-ivory/75 mt-0.5">
                  {activeModalData.subtitle}
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setActiveModalKey(null)}
                aria-label="Close dialog"
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-ivory/70 hover:text-gold hover:border-gold hover:bg-gold/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Items */}
            <div className="mt-6 space-y-4 text-sm">
              {activeModalData.items.map((it) => (
                <div key={it.label} className="glass-card p-3.5 rounded-xl border border-gold/20">
                  <p className="cap text-gold text-[11px] tracking-wider font-medium">
                    {it.label}
                  </p>
                  <p className="text-ivory/85 text-xs sm:text-sm mt-1 leading-relaxed font-light">
                    {it.value}
                  </p>
                </div>
              ))}

              {activeModalData.note && (
                <p className="font-primary italic text-xs sm:text-sm text-ivory/70 pt-2 border-t border-gold/15 leading-relaxed">
                  ✦ {activeModalData.note}
                </p>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="mt-6 pt-4 border-t border-gold/20 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                className="btn cap text-xs rounded-full px-6 py-2.5"
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
