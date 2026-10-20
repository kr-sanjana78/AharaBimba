import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ThreeHeroScene from './components/ThreeHeroScene';
import AharaWizard from './components/AharaWizard';
import HowItWorks from './components/HowItWorks';
import FeatureShowcase from './components/FeatureShowcase';
import ScanHistoryDrawer from './components/ScanHistoryDrawer';
import Footer from './components/Footer';
import {
  Sparkles, ArrowRight, Camera, HelpCircle, CheckCircle2,
  Volume2, ShieldAlert, AlertTriangle, Lightbulb, Smartphone, ShieldCheck
} from 'lucide-react';

const STORAGE_KEY = 'aharabimba_scans_v2';

export default function App() {
  // Light Mode default as explicitly requested (clean white & blue)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [restoredScan, setRestoredScan] = useState(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.className = "bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased transition-colors duration-200";
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.className = "bg-white text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] antialiased transition-colors duration-200";
    }
  }, [isDarkMode]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read history', e);
    }
  }, []);

  const handleSaveHistory = (resultToSave) => {
    const updated = [resultToSave, ...history.filter((h) => h.id !== resultToSave.id)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear history', e);
    }
  };

  const handleScrollToScanner = () => {
    const el = document.getElementById('scanner-wizard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToFilters = () => {
    const el = document.getElementById('food-filters-panel') || document.getElementById('scanner-wizard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenLanguage = () => {
    const el = document.getElementById('language-voice-section') || document.getElementById('scanner-wizard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-800'
    }`}>
      {/* Navbar with Home, Scan Food, Food Filters, How It Works, Language & Theme Toggle */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onScrollToScanner={handleScrollToScanner}
        onScrollToFilters={handleScrollToFilters}
        onScrollToHowItWorks={handleScrollToHowItWorks}
        onOpenLanguageSelector={handleOpenLanguage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* ========================================================
            HERO SECTION: “Do You Really Know What You Eat?”
           ======================================================== */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Welcoming Hero Text strictly matching prompt */}
            <div className="lg:col-span-6 space-y-6">
              {/* AharaBimba Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold tracking-wide">
                  AharaBimba — Know What You Eat, Before You Eat!
                </span>
              </div>

              {/* Exact Requested Heading */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Outfit',sans-serif] leading-[1.1] text-blue-600">
                  Do You Really Know <br />
                  <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                    What You Eat?
                  </span>
                </h1>

                {/* Exact Requested Description */}
                <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                  Food labels can be confusing. AharaBimba helps you understand ingredients, identify potential allergens, check dietary concerns, and listen to clear explanations in your preferred local language.
                </p>
              </div>

              {/* Exact Two Buttons: "Scan Your Food" & "How It Works" */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={handleScrollToScanner}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Scan Your Food</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleScrollToHowItWorks}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl border text-sm sm:text-base font-bold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm'
                  }`}
                >
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  <span>How It Works</span>
                </button>
              </div>

              {/* 3 Main Stages Quick Flow Line */}
              <div className={`grid grid-cols-3 gap-2.5 pt-4 border-t text-xs font-bold ${
                isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-extrabold">1</span>
                  <span className="truncate">1. CAPTURE IT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-extrabold">2</span>
                  <span className="truncate">2. KNOW YOUR FOOD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-extrabold">3</span>
                  <span className="truncate">3. LISTEN IN LANGUAGE</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Packaged Product, Scanning Phone & Ingredient Cards */}
            <div className="lg:col-span-6">
              <ThreeHeroScene
                onStartScan={handleScrollToScanner}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* ========================================================
              PROBLEM STATEMENT & OUR SOLUTION CALLOUT CARDS
             ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Problem Statement Card */}
            <div className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-3 ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-md'
                : 'bg-white border-blue-100 text-slate-800 shadow-md hover:shadow-lg'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                  The Problem
                </span>
              </div>
              <h3 className={`text-lg sm:text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Problem Statement
              </h3>
              <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Consumers often struggle to understand complex food labels, identify ingredients, and recognize potential allergens or dietary concerns. Small text and technical terminology make it difficult to make informed food choices.
              </p>
            </div>

            {/* Our Solution Card */}
            <div className={`p-6 sm:p-7 rounded-3xl border transition-all space-y-3 ${
              isDarkMode
                ? 'bg-slate-900/90 border-blue-500/20 text-slate-200 shadow-md'
                : 'bg-blue-50/60 border-blue-200 text-slate-800 shadow-md hover:shadow-lg'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Our Solution
                </span>
              </div>
              <h3 className={`text-lg sm:text-xl font-extrabold ${isDarkMode ? 'text-blue-300' : 'text-blue-950'}`}>
                AharaBimba Solution
              </h3>
              <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                AharaBimba allows users to capture or upload a food-label image, understand its major ingredients, select personalized dietary filters, and listen to the analysis in their preferred local language.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            3-STAGE SCANNER & VOICE WIZARD
            1. CAPTURE IT → 2. KNOW YOUR FOOD → 3. LISTEN IN YOUR LANGUAGE
           ======================================================== */}
        <section className="space-y-4">
          <AharaWizard
            isDarkMode={isDarkMode}
            onSaveHistory={handleSaveHistory}
            restoredScan={restoredScan}
            onScanRestored={() => setRestoredScan(null)}
          />
        </section>

        {/* How It Works Section */}
        <HowItWorks isDarkMode={isDarkMode} />

        {/* Core Features */}
        <FeatureShowcase isDarkMode={isDarkMode} />
      </main>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />

      {/* Saved Scans Drawer */}
      <ScanHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => setRestoredScan(item)}
        onClearHistory={handleClearHistory}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
