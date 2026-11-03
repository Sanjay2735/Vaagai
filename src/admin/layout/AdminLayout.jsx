import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import logoVaagai from '../../assests/images/Logo-Vaagai.jpeg';

export function AdminLayout({ activeTab = 'dashboard', onNavigate, children }) {
  const { adminUser, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navGroups = [
    {
      group: 'ATELIER & COMMERCE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'products', label: 'Products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { id: 'categories', label: 'Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
        { id: 'collections', label: 'Collections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { id: 'orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { id: 'customers', label: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'inventory', label: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'returns', label: 'Returns & Refunds', icon: 'M16 15v-1a4 4 0 00-4-4H4m0 0l3-3m-3 3l3 3m5 4v1a3 3 0 003 3h4m0 0l-3-3m3 3l-3 3' },
      ],
    },
    {
      group: 'MARKETING & EDITORIAL',
      items: [
        { id: 'coupons', label: 'Coupons & Discounts', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { id: 'homepage', label: 'Homepage CMS', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { id: 'content', label: 'Content Management', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { id: 'reviews', label: 'Patron Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
      ],
    },
    {
      group: 'INTELLIGENCE & REPORTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'reports', label: 'Financial Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      ],
    },
    {
      group: 'GOVERNANCE & SETTINGS',
      items: [
        { id: 'staff', label: 'Staff & Roles', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'activity-logs', label: 'Activity Logs', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'settings', label: 'Store Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      ],
    },
  ];

  const handleNavClick = (id) => {
    window.location.hash = `#admin/${id}`;
    if (onNavigate) onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F1] text-[#29201E] flex flex-col font-sans">
      {/* TOPBAR */}
      <header className="h-16 bg-white border-b border-[#E8E2D9] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        {/* Left: Brand & Toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="p-2 rounded-lg text-[#81766E] hover:text-[#4A0715] hover:bg-[#F5EEE5] transition-colors focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <img
              src={logoVaagai}
              alt="VAAGAI"
              className="w-8 h-8 rounded-full object-cover border border-[#C9A43B]/40 shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.2em] text-sm sm:text-base font-bold text-[#4A0715] leading-none">
                VAAGAI
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#B9953B] font-semibold mt-0.5">
                Atelier Administration
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#81766E]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search sarees, SKU, patrons, orders..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-full focus:outline-none focus:border-[#B9953B] focus:bg-white transition-all text-[#29201E] placeholder-[#81766E]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  window.location.hash = `#admin/products?q=${encodeURIComponent(e.target.value)}`;
                }
              }}
            />
          </div>
        </div>

        {/* Right: Actions, Storefront Link, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Action: New Saree */}
          <button
            onClick={() => {
              window.location.hash = '#admin/products?action=new';
              if (onNavigate) onNavigate('products');
            }}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25] text-xs font-medium rounded-full shadow-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-[#C9A43B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Saree</span>
          </button>

          {/* Live Sync Status Pill */}
          <div
            className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#287A52] bg-[#E8F5E9] border border-[#C8E6C9] rounded-full"
            title="Real-time Server-Sent Events (SSE) stream operational"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#287A52] animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>

          {/* Storefront Preview Shortcut */}
          <a
            href="#home"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-[#70594B] hover:text-[#4A0715] bg-[#F5EEE5] hover:bg-[#E9D9BF]/50 rounded-lg transition-colors border border-[#E8E2D9]"
            title="View live boutique storefront"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">Storefront</span>
          </a>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-[#81766E] hover:text-[#4A0715] hover:bg-[#F5EEE5] rounded-full transition-colors relative"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C34444] rounded-full ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-[#E8E2D9] py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-[#F0EBE1] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#29201E]">Atelier Notifications</span>
                  <span className="text-[10px] text-[#287A52] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-full">3 New</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-[#F7F5F1] text-xs">
                  <div className="px-4 py-2.5 hover:bg-[#F7F5F1] transition-colors cursor-pointer">
                    <p className="font-medium text-[#29201E]">New Order #VAG-2026-981423</p>
                    <p className="text-[11px] text-[#81766E]">Ananya Radhakrishnan purchased Crimson Mayil Kanjivaram (₹43,650)</p>
                    <span className="text-[10px] text-[#B9953B] font-mono mt-1 block">15 min ago</span>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-[#F7F5F1] transition-colors cursor-pointer">
                    <p className="font-medium text-[#C58A28]">Low Stock Alert</p>
                    <p className="text-[11px] text-[#81766E]">Forest Emerald Shikarghar Brocade has only 4 drapes remaining.</p>
                    <span className="text-[10px] text-[#81766E] font-mono mt-1 block">1 hour ago</span>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-[#F7F5F1] transition-colors cursor-pointer">
                    <p className="font-medium text-[#287A52]">Review Moderation</p>
                    <p className="text-[11px] text-[#81766E]">New 5-star review from Sowmya Venkat for Empress Kalamkari.</p>
                    <span className="text-[10px] text-[#81766E] font-mono mt-1 block">3 hours ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-[#F5EEE5] transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#4A0715] text-[#C9A43B] font-serif font-bold text-xs flex items-center justify-center border border-[#C9A43B]/40">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-medium text-[#29201E] max-w-[120px] truncate">
                  {adminUser?.name || 'Vaagai Curator'}
                </span>
                <span className="text-[10px] text-[#81766E] capitalize">
                  {adminUser?.role?.replace('_', ' ') || 'Super Admin'}
                </span>
              </div>
              <svg className="w-3.5 h-3.5 text-[#81766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8E2D9] py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-[#F0EBE1]">
                  <p className="text-xs font-semibold text-[#29201E]">{adminUser?.name}</p>
                  <p className="text-[11px] text-[#81766E] truncate">{adminUser?.email}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#4A0715]/10 text-[#4A0715] rounded-full font-bold">
                    {adminUser?.role?.replace('_', ' ')}
                  </span>
                </div>
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      handleNavClick('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[#29201E] hover:bg-[#F7F5F1] transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4 text-[#81766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Store Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavClick('activity-logs');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[#29201E] hover:bg-[#F7F5F1] transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4 text-[#81766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Activity Audit Trail</span>
                  </button>
                </div>
                <div className="pt-1 border-t border-[#F0EBE1]">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-[#C34444] hover:bg-[#FDE8E8] transition-colors text-xs font-medium flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR (Desktop & Mobile Overlay) */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30 pt-16 lg:pt-0 bg-white border-r border-[#E8E2D9] flex flex-col transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-64' : 'w-20'}
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {sidebarOpen && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#B9953B] mb-2">
                    {group.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`
                          w-full flex items-center rounded-lg text-xs font-medium transition-colors
                          ${sidebarOpen ? 'px-3 py-2 space-x-3' : 'px-3 py-2.5 justify-center'}
                          ${
                            isActive
                              ? 'bg-[#4A0715] text-[#F5EEE5] shadow-xs'
                              : 'text-[#29201E] hover:bg-[#F5EEE5] hover:text-[#4A0715]'
                          }
                        `}
                      >
                        <svg
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#C9A43B]' : 'text-[#81766E]'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                        </svg>
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer with Live DB Engine Indicator */}
          <div className="p-3 border-t border-[#E8E2D9] bg-[#F7F5F1]">
            {sidebarOpen ? (
              <div className="flex items-center space-x-2 text-[11px] text-[#70594B]">
                <span className="w-2 h-2 rounded-full bg-[#287A52] animate-pulse"></span>
                <span className="font-mono text-[10px] truncate">Storage: Active & Synced</span>
              </div>
            ) : (
              <div className="flex justify-center" title="System Online">
                <span className="w-2 h-2 rounded-full bg-[#287A52]"></span>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto bg-[#F7F5F1] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

