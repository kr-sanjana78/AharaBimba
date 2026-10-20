import React, { useState, useEffect } from 'react';
import { LOCAL_LANGUAGES } from '../data/ingredientsData';
import { speechAssistant } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle, Volume2,
  VolumeX, Play, Pause, Square, Calendar, Clock, Sparkles, CheckCircle2,
  XCircle, ArrowLeft, BookmarkPlus, Share2, Printer, Info, RefreshCw
} from 'lucide-react';

export default function ResultsDashboard({ analysisResult, onScanAnother, onSaveHistory }) {
  const [selectedLanguage, setSelectedLanguage] = useState('kn-IN');
  const [speechState, setSpeechState] = useState('idle'); // 'idle' | 'playing' | 'paused'
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [isSaved, setIsSaved] = useState(false);
  const [swappedDate, setSwappedDate] = useState(false);

  const {
    status,
    verdict,
    confidence,
    rawText,
    flaggedMatches = [],
    safeFilters = [],
    allDetectedIngredients = [],
    dateInfo = {},
    speechScripts = {}
  } = analysisResult;

  // Trigger celebration confetti if product is 100% clean / safe
  useEffect(() => {
    if (status === 'clear') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#52B788', '#74C69D', '#D8F3DC']
      });
    }

    const unsubscribe = speechAssistant.subscribe((event) => {
      setSpeechState(event.state);
    });

    return () => {
      speechAssistant.stop();
      unsubscribe();
    };
  }, [status]);

  // Handle Speech Synthesis
  const handlePlayVoice = () => {
    const script = speechScripts[selectedLanguage] || speechScripts['en-IN'];
    if (!script) return;

    if (speechState === 'paused') {
      speechAssistant.resume();
    } else {
      speechAssistant.speak({
        text: script,
        lang: selectedLanguage,
        rate: speechSpeed
      });
    }
  };

  const handlePauseVoice = () => {
    speechAssistant.pause();
  };

  const handleStopVoice = () => {
    speechAssistant.stop();
  };

  const handleSaveToHistory = () => {
    if (onSaveHistory) {
      onSaveHistory(analysisResult);
      setIsSaved(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Status Styling Config
  const statusConfig = {
    flagged: {
      bg: 'bg-rose-950/40 border-rose-600/50',
      badge: 'bg-rose-900/60 text-rose-300 border-rose-500/40',
      icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
      title: 'Possible Ingredient Match Detected',
      subtitle: 'This product contains ingredients matching your dietary restrictions.'
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-500/50',
      badge: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
      icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
      title: 'Review Recommended (Product Expired or Needs Verification)',
      subtitle: 'The label has date expiry alerts or ambiguous parameters that need review.'
    },
    clear: {
      bg: 'bg-emerald-950/40 border-emerald-500/50',
      badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      title: 'No Selected Ingredients Detected',
      subtitle: 'None of your active allergens or dietary filters were identified on this label.'
    },
    unclear: {
      bg: 'bg-slate-900/50 border-slate-600/50',
      badge: 'bg-slate-800 text-slate-300 border-slate-600/40',
      icon: <HelpCircle className="w-8 h-8 text-slate-400" />,
      title: 'Could Not Verify Label Confidently',
      subtitle: 'OCR confidence is limited. Please inspect the original packaging.'
    }
  }[status] || {
    bg: 'bg-[#1B4332]/50 border-[#52B788]/40',
    badge: 'bg-[#12372A] text-[#74C69D] border-[#52B788]/30',
    icon: <Info className="w-8 h-8 text-[#52B788]" />,
    title: verdict,
    subtitle: 'Label Analysis Summary'
  };

  return (
    <div id="results-dashboard" className="w-full space-y-8 animate-fadeIn scroll-mt-24">
      {/* Top Action Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4332]/80 hover:bg-[#2D6A4F] text-sm font-semibold text-[#D8F3DC] border border-[#52B788]/30 transition-all shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another Packaging</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToHistory}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isSaved
                ? 'bg-emerald-900/40 border-emerald-600/40 text-emerald-300'
                : 'bg-[#12372A] border-[#52B788]/30 text-[#D8F3DC] hover:bg-[#1B4332]'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved to History' : 'Save Scan'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#12372A] border border-[#52B788]/30 text-[#D8F3DC] hover:bg-[#1B4332] text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Status Banner */}
      <div className={`glass-panel rounded-3xl p-6 sm:p-8 border ${statusConfig.bg} shadow-2xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#0B1E16]/80 border border-white/10 shadow-lg">
              {statusConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusConfig.badge}`}>
                  {verdict}
                </span>
                <span className="text-xs text-[#D8F3DC]/60 font-mono">
                  OCR Accuracy: {confidence}%
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAF9F6] tracking-tight">
                {statusConfig.title}
              </h3>
              <p className="text-sm text-[#D8F3DC]/80 mt-1 max-w-2xl">
                {statusConfig.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Required Hackathon Disclaimer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-2.5 text-xs text-[#D8F3DC]/70">
          <Info className="w-4 h-4 text-[#E9B949] shrink-0 mt-0.5" />
          <span>
            <strong>Safety Verification Notice:</strong> This analysis is generated through OCR and rule-based pattern matching. It does not provide medical diagnoses and cannot guarantee that packaging is 100% free of allergen cross-contact. Always verify critical safety details with the physical product.
          </span>
        </div>
      </div>

      {/* Local-Language Voice Assistant Bar */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#52B788]/30 shadow-xl space-y-5 bg-gradient-to-br from-[#12372A]/90 to-[#0B1E16]/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F] flex items-center justify-center text-[#74C69D] shadow-inner">
              <Volume2 className="w-5 h-5 text-[#52B788]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#FAF9F6]">
                Voice Assistant (ಸ್ಥಳೀಯ ಧ್ವನಿ ಸಹಾಯಕ)
              </h4>
              <p className="text-xs text-[#D8F3DC]/70">
                Listen to the simple spoken explanation in your preferred local language.
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#D8F3DC]/60">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                speechAssistant.stop();
                setSelectedLanguage(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0B1E16] border border-[#52B788]/40 text-xs font-semibold text-[#FAF9F6] focus:outline-none focus:border-[#52B788]"
            >
              {LOCAL_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="p-4 rounded-2xl bg-[#0B1E16]/80 border border-[#52B788]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {speechState === 'playing' ? (
              <button
                onClick={handlePauseVoice}
                className="w-11 h-11 rounded-full bg-[#E9B949] hover:bg-[#D4A373] text-[#0B1E16] flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
                title="Pause Audio"
              >
                <Pause className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handlePlayVoice}
                className="w-11 h-11 rounded-full bg-[#52B788] hover:bg-[#74C69D] text-[#0B1E16] flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-[#52B788]/30"
                title="Play Audio Explanation"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            )}

            <button
              onClick={handleStopVoice}
              disabled={speechState === 'idle'}
              className="w-10 h-10 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF9F6] disabled:opacity-40 flex items-center justify-center transition-colors border border-[#52B788]/20"
              title="Stop Audio"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            {/* Live Audio Equalizer Animation */}
            {speechState === 'playing' && (
              <div className="flex items-end gap-1 h-6 px-2">
                <span className="w-1 bg-[#52B788] rounded-full animate-pulse-bar-1"></span>
                <span className="w-1 bg-[#52B788] rounded-full animate-pulse-bar-2"></span>
                <span className="w-1 bg-[#74C69D] rounded-full animate-pulse-bar-3"></span>
                <span className="w-1 bg-[#52B788] rounded-full animate-pulse-bar-4"></span>
                <span className="w-1 bg-[#74C69D] rounded-full animate-pulse-bar-5"></span>
              </div>
            )}
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#D8F3DC]/60">Speech Speed:</span>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechSpeed(rate)}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  speechSpeed === rate
                    ? 'bg-[#52B788] text-[#0B1E16] border-[#52B788] font-bold'
                    : 'bg-[#12372A] text-[#D8F3DC] border-[#52B788]/20 hover:bg-[#1B4332]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Spoken Text Transcript in Native Script */}
        <div className="p-4 rounded-2xl bg-[#0E291E]/60 border border-[#52B788]/15 space-y-1.5">
          <span className="text-[11px] font-semibold text-[#74C69D] uppercase tracking-wider block">
            Spoken Transcript ({LOCAL_LANGUAGES.find(l => l.code === selectedLanguage)?.name})
          </span>
          <p className="text-sm text-[#FAF9F6] leading-relaxed font-['Noto_Sans_Kannada',sans-serif]">
            {speechScripts[selectedLanguage] || speechScripts['en-IN']}
          </p>
        </div>
      </div>

      {/* Date & Shelf Life Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#52B788]/25 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#52B788]" />
            <h4 className="text-lg font-bold text-[#FAF9F6]">
              Packaging Date & Shelf Life Information
            </h4>
          </div>
          {dateInfo.hasDates && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#1B4332] text-[#74C69D] font-mono">
              Dates Detected
            </span>
          )}
        </div>

        {dateInfo.hasDates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expiry Card */}
            {dateInfo.expiryDate && (
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                  dateInfo.expiryDate.status === 'expired'
                    ? 'bg-rose-950/40 border-rose-600/40 text-rose-200'
                    : dateInfo.expiryDate.status === 'expiring_soon'
                    ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Best Before / Expiry Date</span>
                  </div>
                  <p className="text-xl font-extrabold text-[#FAF9F6]">
                    {dateInfo.expiryDate.formatted}
                  </p>
                  <p className="text-xs opacity-80">
                    Status: {dateInfo.expiryDate.message}
                  </p>
                </div>

                {dateInfo.expiryDate.isAmbiguous && (
                  <button
                    onClick={() => setSwappedDate(!swappedDate)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF9F6] border border-white/20 transition-colors"
                  >
                    Confirm Date Format
                  </button>
                )}
              </div>
            )}

            {/* Manufacturing / Packed Card */}
            {dateInfo.mfgDate && (
              <div className="p-4 rounded-2xl bg-[#0B1E16]/60 border border-[#52B788]/20 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#74C69D] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Manufacturing / Packed Date</span>
                  </div>
                  <p className="text-xl font-bold text-[#FAF9F6]">
                    {dateInfo.mfgDate.formatted}
                  </p>
                  <p className="text-xs text-[#D8F3DC]/60 font-mono">
                    Extracted from label: {dateInfo.rawMfgString || dateInfo.mfgDate.raw}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0B1E16]/40 border border-[#52B788]/15 text-xs text-[#D8F3DC]/70 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-[#FAF9F6]">No Explicit Date Found in OCR Text</p>
              <p>Packaging dates may be stamped on the bottle cap, crimp, or foil edge outside the camera frame.</p>
            </div>
          </div>
        )}
      </div>

      {/* Flagged Ingredients Detail Cards */}
      {flaggedMatches.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-600/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h4 className="text-lg font-bold text-[#FAF9F6]">
              Detected Selected Allergens & Ingredients ({flaggedMatches.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaggedMatches.map((match, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-rose-950/30 border border-rose-600/30 space-y-2 hover:bg-rose-950/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{match.icon}</span>
                    <h5 className="font-bold text-sm text-[#FAF9F6]">{match.categoryName}</h5>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 font-semibold border border-rose-500/40">
                    Flagged
                  </span>
                </div>

                <p className="text-xs text-[#D8F3DC]/90 leading-relaxed">
                  {match.reason}
                </p>

                {match.contextSnippet && (
                  <div className="p-2.5 rounded-xl bg-[#0B1E16]/70 border border-white/5 text-[11px] font-mono text-[#D8F3DC]/70">
                    Label Context: {match.contextSnippet}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Filters Verified */}
      {safeFilters.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-[#52B788]/20 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
            <h4 className="text-sm font-bold text-[#FAF9F6] uppercase tracking-wider">
              Selected Checks Not Detected on Label ({safeFilters.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {safeFilters.map((sf) => (
              <span
                key={sf.categoryId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#12372A]/80 text-[#74C69D] border border-[#52B788]/25"
              >
                <span>{sf.icon}</span>
                <span>{sf.categoryName}: None Detected</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recognized Ingredients Breakdown */}
      {allDetectedIngredients.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-[#52B788]/25 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E9B949]" />
              <h4 className="text-sm font-bold text-[#FAF9F6] uppercase tracking-wider">
                All Identified Food Ingredients ({allDetectedIngredients.length})
              </h4>
            </div>
            <span className="text-xs text-[#D8F3DC]/60 font-mono">
              Auto-Taxonomy Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {allDetectedIngredients.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0E291E]/60 border border-[#52B788]/15 flex flex-col justify-between"
              >
                <span className="text-xs font-bold text-[#FAF9F6] line-clamp-1">
                  {item.name}
                </span>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#52B788]/10 text-[10px]">
                  <span className="text-[#D8F3DC]/60">{item.category}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1B4332] text-[#74C69D] font-mono">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Extracted Text Transparency Drawer */}
      <div className="glass-panel rounded-3xl p-6 border border-[#52B788]/20 space-y-3">
        <h4 className="text-xs font-semibold text-[#52B788] uppercase tracking-wider">
          Full Raw Optical Text (For Manual Verification)
        </h4>
        <div className="p-4 rounded-2xl bg-[#0B1E16]/80 border border-[#52B788]/15 font-mono text-xs text-[#FAF9F6]/80 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {rawText}
        </div>
      </div>
    </div>
  );
}
