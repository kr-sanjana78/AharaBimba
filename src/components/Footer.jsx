import React from 'react';
import { Heart, AlertTriangle } from 'lucide-react';

export default function Footer({ isDarkMode }) {
  return (
    <footer className={`w-full border-t pt-12 pb-16 transition-colors ${
      isDarkMode
        ? 'bg-slate-950 border-slate-800 text-slate-300'
        : 'bg-slate-50 border-blue-100 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 p-1.5 shadow-md shadow-blue-500/20">
                <img src="/logo.svg" alt="AharaBimba Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-extrabold font-['Outfit',sans-serif] text-blue-600">
                Ahara<span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Bimba</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Know What You Eat, Before You Eat! — ಆಹಾರಬಿಂಬ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              ಕನ್ನಡ • Kannada
            </span>
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              हिन्दी • Hindi
            </span>
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              தமிழ் • Tamil
            </span>
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              తెలుగు • Telugu
            </span>
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              English
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Safety Notice:</strong> AharaBimba is an educational food label scanner designed to assist with language translation and visual accessibility. It does NOT provide medical advice and cannot guarantee 100% allergen safety or absence of factory cross-contamination. Always check original physical packaging.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 pt-2">
          <p>© {new Date().getFullYear()} AharaBimba. Know What You Eat, Before You Eat!</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Built with care for everyday health & accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
