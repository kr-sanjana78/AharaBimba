import React from 'react';
import { Box, Sparkles, Languages, Calendar, ShieldCheck, Heart } from 'lucide-react';

const FEATURES = [
  {
    icon: <Languages className="w-6 h-6 text-blue-600" />,
    title: 'Listen in your local language',
    desc: 'Simple spoken explanation in Kannada (ಕನ್ನಡ), Hindi, Tamil, Telugu, and English so anyone can listen without reading small fonts.'
  },
  {
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    title: 'Smart Expiry & Best Before Checker',
    desc: 'Never eat expired food. AharaBimba automatically finds the expiry date and tells you how many days remain before it expires.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    title: 'Allergen & Health Filter Guard',
    desc: 'Guards against peanuts, milk solids, maida/gluten, high fructose sugar, animal gelatin, and MSG chemical preservatives.'
  },
  {
    icon: <Box className="w-6 h-6 text-blue-600" />,
    title: 'Modern 3D Interactive Visualizer',
    desc: 'Interactive 3D food packaging scene built with Three.js featuring real-time scanning laser and orbiting ingredients.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-blue-600" />,
    title: 'On-Device Optical Text Reader',
    desc: 'Uses high-speed client-side OCR (Tesseract.js) to read packaging text directly on your device with complete privacy.'
  },
  {
    icon: <Heart className="w-6 h-6 text-blue-600" />,
    title: 'User-Friendly & Honest',
    desc: 'Uncluttered step-by-step layout designed for everyday families. Honest "Check packaging" alerts when images are blurry.'
  }
];

export default function FeatureShowcase({ isDarkMode }) {
  return (
    <section id="features" className="w-full space-y-8 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
          Why Choose AharaBimba
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-['Outfit',sans-serif]">
          Know What You Eat, Before You Eat!
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Making packaged food transparency simple, visual, and accessible through voice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className={`p-6 sm:p-7 rounded-3xl border transition-all ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-blue-100 shadow-sm hover:shadow-md text-slate-800'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-blue-50 border border-blue-200'
            }`}>
              {feat.icon}
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {feat.title}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
