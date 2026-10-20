import React from 'react';
import { Camera, SlidersHorizontal, Volume2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    stageName: 'CAPTURE IT',
    title: 'Scan or Upload Image',
    desc: 'Photograph the food label using your device camera or upload a JPG/PNG. Built-in OCR instantly extracts readable label text.',
    icon: <Camera className="w-6 h-6 text-blue-600" />
  },
  {
    num: '02',
    stageName: 'KNOW YOUR FOOD',
    title: 'Personalized Analysis',
    desc: 'Understand what ingredients really mean in plain words. Select Meesho-style dietary filters and check sugar, salt, fat, and allergen warnings.',
    icon: <SlidersHorizontal className="w-6 h-6 text-blue-600" />
  },
  {
    num: '03',
    stageName: 'LISTEN IN YOUR LANGUAGE',
    title: 'Voice Explanation',
    desc: 'Listen to clear spoken explanations in Kannada (ಕನ್ನಡ), Hindi, English, Tamil, or Telugu with full Play, Pause, and Replay controls.',
    icon: <Volume2 className="w-6 h-6 text-blue-600" />
  }
];

export default function HowItWorks({ isDarkMode }) {
  return (
    <section id="how-it-works" className="w-full space-y-8 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
          How It Works
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-['Outfit',sans-serif]">
          3 Simple Stages to Food Clarity
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          AharaBimba — Know What You Eat, Before You Eat! Simple, visual, and accessible for everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={`p-6 sm:p-8 rounded-3xl border transition-all flex flex-col justify-between ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white shadow-lg'
                : 'bg-white border-blue-100 shadow-md hover:shadow-xl text-slate-800'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5 shadow-sm">
                {step.icon}
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  STAGE {step.num}
                </span>
                <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                  {step.stageName}
                </span>
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {step.title}
              </h3>

              <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {step.desc}
              </p>
            </div>

            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold ${
              isDarkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% Free & No Sign-In</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
