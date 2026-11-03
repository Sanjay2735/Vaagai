import React from 'react';

export const TRUST_PILLARS = [
  {
    icon: '✦',
    title: 'Silk Mark Certified',
    subtitle: '100% Natural Mulberry Silk',
    description: 'Government certified biological pure silk, woven without synthetic adulteration.',
  },
  {
    icon: '✤',
    title: 'Master Pit-Looms',
    subtitle: 'Ancestral Weaving Guilds',
    description: 'Direct patronage to over 350 artisan families across traditional weaving clusters.',
  },
  {
    icon: '✺',
    title: 'Bridal Concierge',
    subtitle: 'Bespoke Styling Assistance',
    description: 'Private atelier drape appointments, customized blouse tailoring, and color consultations.',
  },
  {
    icon: '❖',
    title: 'Worldwide Transit',
    subtitle: 'Insured Luxury Courier',
    description: 'Dispatched with tamper-evident wax seal medallions and real-time door-to-door tracking.',
  },
];

export function Trust() {
  return (
    <section
      id="trust"
      aria-label="VAAGAI Heritage Guarantees"
      className="relative bg-[#29201E] text-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-gold/20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-burgundy/20 border border-gold/20 hover:border-gold/50 transition-all duration-400 group"
            >
              <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center text-gold text-xl mb-4 bg-burgundy/40 group-hover:scale-105 group-hover:bg-gold group-hover:text-charcoal transition-all">
                {item.icon}
              </div>
              <h3 className="font-serif text-lg text-ivory group-hover:text-gold transition-colors">
                {item.title}
              </h3>
              <span className="cap-sm text-gold/80 block text-[9.5px] mt-0.5">
                {item.subtitle}
              </span>
              <p className="font-serif italic text-xs text-ivory/70 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
