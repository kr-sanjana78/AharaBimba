import React, { useState } from 'react';
import { Camera, Sun, Moon, SlidersHorizontal, Globe, HelpCircle, History, Sparkles } from 'lucide-react';

export default function Navbar({
  onOpenHistory,
  historyCount = 0,
  onScrollToScanner,
  onScrollToFilters,
  onScrollToHowItWorks,
  onOpenLanguageSelector,
  isDarkMode,
  onToggleDarkMode,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (callback) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
      isDarkMode
        ? 'bg-slate-900/95 border-slate-800 text-white shadow-lg shadow-black/20'
        : 'bg-white/95 border-blue-100 text-slate-800 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Logo: AharaBimba — Know What You Eat, Before You Eat! */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileMenuOpen(false);
          }}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-300 flex items-center justify-center p-2 shadow-md shadow-blue-500/20 group">
            <img
              src="/logo.svg"
              alt="AharaBimba Logo"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Outfit',sans-serif] text-blue-600">
                Ahara<span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Bimba</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                ಆಹಾರಬಿಂಬ
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 tracking-tight font-medium hidden sm:block">
              Know What You Eat, Before You Eat!
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links (Strictly matching prompt: Home, Scan Food, Food Filters, How It Works, Language) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`transition-colors hover:text-blue-600 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Home
          </button>

          <button
            onClick={onScrollToScanner}
            className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Food</span>
          </button>

          <button
            onClick={onScrollToFilters}
            className={`transition-colors hover:text-blue-600 flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Food Filters</span>
          </button>

          <button
            onClick={onScrollToHowItWorks}
            className={`transition-colors hover:text-blue-600 flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>How It Works</span>
          </button>

          <button
            onClick={onOpenLanguageSelector}
            className={`transition-colors hover:text-blue-600 flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Language</span>
          </button>
        </nav>

        {/* Action Controls & Light/Dark Mode Switch */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Prominent Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shadow-sm cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
            title={isDarkMode ? 'Switch to Light Mode (White Background)' : 'Switch to Dark Mode (Deep Navy Background)'}
            aria-label="Toggle Dark and Light Mode"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {/* Saved History Trigger */}
          <button
            onClick={onOpenHistory}
            className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
            title="Saved Food Label Scans"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {historyCount}
              </span>
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onScrollToScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">Scan Food</span>
          </button>
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className={`md:hidden px-4 py-2 border-t flex items-center justify-around text-xs font-bold overflow-x-auto ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-blue-50/60 border-blue-100 text-slate-700'
      }`}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-2 py-1">
          Home
        </button>
        <button onClick={onScrollToScanner} className="px-2 py-1 text-blue-600">
          Scan Food
        </button>
        <button onClick={onScrollToFilters} className="px-2 py-1">
          Food Filters
        </button>
        <button onClick={onScrollToHowItWorks} className="px-2 py-1">
          How It Works
        </button>
        <button onClick={onOpenLanguageSelector} className="px-2 py-1 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span>Language</span>
        </button>
      </div>
    </header>
  );
}
