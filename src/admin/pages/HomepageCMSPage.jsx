import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function HomepageCMSPage() {
  const [hero, setHero] = useState({
    eyebrow: 'Artisanal Heritage — Chennai Atelier',
    title: 'Timeless South Indian Couture',
    subtitle: 'Crafted from pure mulberry silk, hand-woven gold zari, and centuries of temple craftsmanship.',
    primaryCtaText: 'Explore Collection',
    primaryCtaLink: '#collection',
    secondaryCtaText: 'Kalakaari Art',
    secondaryCtaLink: '#kalakaari',
    badgeText: 'Handloom Certified',
  });

  const [announcement, setAnnouncement] = useState({
    text: 'Complimentary Pan-India Express Delivery & Bespoke Blouse Tailoring on all Orders.',
    linkText: 'Discover Kalakaari',
    linkUrl: '#kalakaari',
    enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [savingAnnounce, setSavingAnnounce] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadCMS() {
      try {
        const [heroRes, annRes] = await Promise.all([
          adminApi.getContentSection('hero'),
          adminApi.getContentSection('announcement'),
        ]);

        if (heroRes.success && heroRes.content) setHero(heroRes.content);
        if (annRes.success && annRes.content) setAnnouncement(annRes.content);
      } catch (err) {
        console.error('Failed to load CMS:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCMS();
  }, []);

  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    setMessage('');
    try {
      await adminApi.updateContentSection('hero', hero);
      setMessage('Hero section updated successfully! Changes reflect on the storefront.');
    } catch (err) {
      alert(err.message || 'Failed to update hero');
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveAnnounce = async (e) => {
    e.preventDefault();
    setSavingAnnounce(true);
    setMessage('');
    try {
      await adminApi.updateContentSection('announcement', announcement);
      setMessage('Announcement banner updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update announcement');
    } finally {
      setSavingAnnounce(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Homepage & Editorial CMS
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Dynamic control over storefront hero headlines, storytelling copy, announcement bar, and luxury CTA portals.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] text-[#287A52] text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
          <span>✓ {message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HERO SECTION CMS FORM */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <h2 className="font-serif text-base font-bold text-[#4A0715]">
              Cinematic Hero Banner Content
            </h2>
            <span className="text-[10px] font-mono text-[#B9953B] font-bold">section: hero</span>
          </div>

          <form onSubmit={handleSaveHero} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Eyebrow Brand Header</label>
              <input
                type="text"
                value={hero.eyebrow}
                onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Main Editorial Headline</label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-serif text-sm font-bold focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Supporting Manifesto / Subtitle</label>
              <textarea
                rows={3}
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Primary CTA Label</label>
                <input
                  type="text"
                  value={hero.primaryCtaText}
                  onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Primary CTA Target</label>
                <input
                  type="text"
                  value={hero.primaryCtaLink}
                  onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-mono focus:outline-none focus:border-[#B9953B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Secondary CTA Label</label>
                <input
                  type="text"
                  value={hero.secondaryCtaText}
                  onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Secondary CTA Target</label>
                <input
                  type="text"
                  value={hero.secondaryCtaLink}
                  onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-mono focus:outline-none focus:border-[#B9953B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Atelier Craft Seal Badge</label>
              <input
                type="text"
                value={hero.badgeText}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingHero}
                className="w-full py-2 bg-[#4A0715] hover:bg-[#720F25] text-[#F5EEE5] font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {savingHero ? 'Saving Hero...' : 'Save & Publish Hero Updates'}
              </button>
            </div>
          </form>
        </div>

        {/* ANNOUNCEMENT BAR & LIVE PREVIEW */}
        <div className="space-y-6">
          {/* Announcement Bar Form */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <h2 className="font-serif text-base font-bold text-[#4A0715]">
                Announcement Ribbon Banner
              </h2>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                />
                <span className="text-xs font-semibold text-[#29201E]">Ribbon Visible</span>
              </label>
            </div>

            <form onSubmit={handleSaveAnnounce} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Ribbon Text</label>
                <input
                  type="text"
                  value={announcement.text}
                  onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                  placeholder="e.g. Complimentary Pan-India Express Delivery..."
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Link Label</label>
                  <input
                    type="text"
                    value={announcement.linkText}
                    onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Link Target</label>
                  <input
                    type="text"
                    value={announcement.linkUrl}
                    onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-mono focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingAnnounce}
                  className="w-full py-2 bg-[#70594B] hover:bg-[#4A0715] text-[#F5EEE5] font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {savingAnnounce ? 'Saving...' : 'Update Announcement'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#29201E] text-white p-6 rounded-2xl shadow-xl border border-[#C9A43B]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C9A43B] font-bold">
                Live Storefront Preview
              </span>
              <span className="w-2 h-2 rounded-full bg-[#287A52] animate-pulse"></span>
            </div>

            {/* Announcement preview */}
            {announcement.enabled && (
              <div className="py-1.5 px-3 bg-[#4A0715] text-[10px] text-center text-[#E9D9BF] rounded-lg flex items-center justify-center space-x-2 border border-[#C9A43B]/30">
                <span>{announcement.text}</span>
                <span className="underline font-semibold text-[#C9A43B]">{announcement.linkText}</span>
              </div>
            )}

            {/* Hero preview */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] uppercase tracking-widest text-[#C9A43B] font-semibold">
                {hero.eyebrow}
              </span>
              <h3 className="font-serif text-2xl font-bold tracking-wide text-[#F5EEE5]">
                {hero.title}
              </h3>
              <p className="text-xs text-[#E9D9BF]/80 line-clamp-3">
                {hero.subtitle}
              </p>

              <div className="flex items-center space-x-3 pt-3">
                <span className="px-4 py-1.5 bg-[#C9A43B] text-[#4A0715] font-serif font-bold text-xs rounded-sm">
                  {hero.primaryCtaText}
                </span>
                <span className="px-4 py-1.5 border border-[#C9A43B]/60 text-[#E9D9BF] font-serif text-xs rounded-sm">
                  {hero.secondaryCtaText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

