import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { PERSONALIZED_FILTERS, SAMPLE_LABELS, LOCAL_LANGUAGES } from '../data/ingredientsData';
import { analyzeLabelText } from '../utils/analyzer';
import { speechAssistant } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  Camera, Upload, Check, AlertTriangle, ShieldAlert, ShieldCheck,
  Volume2, Play, Pause, RotateCcw, ArrowRight, ArrowLeft, RefreshCw,
  X, Calendar, Clock, ChevronDown, ChevronUp, BookmarkPlus, Video,
  Info, Sparkles, HeartPulse, SlidersHorizontal, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';

export default function AharaWizard({ isDarkMode, onSaveHistory, restoredScan, onScanRestored }) {
  // Wizard Steps matching prompt specification:
  // 1: CAPTURE IT (Scan or Upload & Select Dietary Filters)
  // 2: KNOW YOUR FOOD (Personalized Analysis & Live Filter Warnings)
  // 3: LISTEN IN YOUR LANGUAGE (Voice Explanation & Controls)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Image & Camera State
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [selectedImageSource, setSelectedImageSource] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [isBlurryOrUnreadable, setIsBlurryOrUnreadable] = useState(false);

  // Live Camera stream
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Meesho-style Dietary Filters
  const [selectedFilterIds, setSelectedFilterIds] = useState([
    'diabetes',
    'allergies',
    'lactose',
    'vegetarian',
    'high_salt'
  ]);

  // Step 3: Analysis & Speech State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('kn-IN');
  const [speechState, setSpeechState] = useState('idle'); // 'idle' | 'playing' | 'paused'
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [showRawText, setShowRawText] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // DOM Refs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Restore scan from history if selected
  useEffect(() => {
    if (restoredScan) {
      setAnalysisResult(restoredScan);
      setExtractedText(restoredScan.rawText || '');
      setImagePreviewUrl(restoredScan.imageSource || null);
      setSelectedSampleId(restoredScan.sampleId || null);
      setCurrentStep(2);
      if (onScanRestored) onScanRestored();
      const el = document.getElementById('scanner-wizard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [restoredScan]);

  // Subscribe to speech synthesis events
  useEffect(() => {
    const unsubscribe = speechAssistant.subscribe((event) => {
      setSpeechState(event.state);
    });
    return () => {
      speechAssistant.stop();
      unsubscribe();
    };
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  const startCameraStream = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLiveCameraOpen(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access was blocked or is unavailable. Please click "Take Photo" or upload an image.');
    }
  };

  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setImagePreviewUrl(dataUrl);
    setSelectedImageSource(dataUrl);
    setSelectedSampleId(null);
    stopCameraStream();
    runOcrOnImage(dataUrl);
  };

  // File Upload Handlers (Option A camera input or Option B gallery input)
  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
    setSelectedImageSource(file);
    setSelectedSampleId(null);
    stopCameraStream();
    runOcrOnImage(file);
  };

  // Quick 1-Tap Sample Selection
  const handleSelectSample = (sample) => {
    setSelectedSampleId(sample.id);
    setImagePreviewUrl(sample.image);
    setSelectedImageSource(sample.image);
    setExtractedText(sample.simulatedText);
    setIsBlurryOrUnreadable(false);
    stopCameraStream();
  };

  // Retake & Remove Handlers (Explicitly required by prompt)
  const handleRetake = () => {
    speechAssistant.stop();
    setImagePreviewUrl(null);
    setSelectedImageSource(null);
    setSelectedSampleId(null);
    setExtractedText('');
    setIsBlurryOrUnreadable(false);
    startCameraStream();
  };

  const handleRemoveImage = () => {
    speechAssistant.stop();
    setImagePreviewUrl(null);
    setSelectedImageSource(null);
    setSelectedSampleId(null);
    setExtractedText('');
    setIsBlurryOrUnreadable(false);
    stopCameraStream();
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Real Client-Side OCR with Tesseract.js & Preprocessing
  const runOcrOnImage = async (imageSrc) => {
    setIsProcessingOcr(true);
    setIsBlurryOrUnreadable(false);
    setOcrStatusText('Optimizing image contrast...');
    setOcrProgress(15);

    try {
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

      if (typeof imageSrc === 'string') {
        img.src = imageSrc;
      } else {
        img.src = URL.createObjectURL(imageSrc);
      }
      await loadPromise;

      // Enhance contrast for cleaner text recognition
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.4 + 128));
        data[i] = enhanced;
        data[i + 1] = enhanced;
        data[i + 2] = enhanced;
      }
      ctx.putImageData(imgData, 0, 0);
      const processedUrl = canvas.toDataURL('image/jpeg', 0.95);

      setOcrStatusText('Reading ingredients & nutrition table...');
      setOcrProgress(40);

      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(40 + Math.round(m.progress * 55));
            setOcrStatusText(`Reading text: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const ret = await worker.recognize(processedUrl);
      await worker.terminate();

      const text = ret.data.text.trim();
      const words = text.split(/\s+/).filter((w) => w.length > 2);

      if (words.length < 5) {
        setIsBlurryOrUnreadable(true);
        setExtractedText('');
      } else {
        setExtractedText(text);
        setIsBlurryOrUnreadable(false);
      }
      setOcrStatusText('Done reading!');
      setOcrProgress(100);
    } catch (err) {
      console.warn('OCR error:', err);
      setIsBlurryOrUnreadable(true);
      setExtractedText('');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // Step 2 & 3 Transition: "Understand My Food"
  const handleUnderstandMyFood = () => {
    if (!extractedText.trim() && !selectedSampleId) {
      alert('Please photograph a food label, upload an image, or tap a sample food product.');
      return;
    }

    const result = analyzeLabelText(extractedText, selectedFilterIds);
    result.imageSource = imagePreviewUrl;
    result.sampleId = selectedSampleId;
    result.id = 'scan_' + Date.now();
    result.timestamp = new Date().toISOString();

    setAnalysisResult(result);
    setCurrentStep(2);

    const wizardEl = document.getElementById('scanner-wizard');
    if (wizardEl) wizardEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Re-run evaluation when user toggles filters
  const toggleFilter = (filterId) => {
    const updated = selectedFilterIds.includes(filterId)
      ? selectedFilterIds.filter((id) => id !== filterId)
      : [...selectedFilterIds, filterId];

    setSelectedFilterIds(updated);

    if (analysisResult && extractedText) {
      const reResult = analyzeLabelText(extractedText, updated);
      reResult.imageSource = imagePreviewUrl;
      reResult.sampleId = selectedSampleId;
      reResult.id = analysisResult.id;
      reResult.timestamp = analysisResult.timestamp;
      setAnalysisResult(reResult);
    }
  };

  const handleGoToVoiceStep = () => {
    setCurrentStep(3);
    if (analysisResult && analysisResult.status === 'clear') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#38BDF8', '#60A5FA']
      });
    }
    const wizardEl = document.getElementById('scanner-wizard');
    if (wizardEl) wizardEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Voice Handlers: Play, Pause, Replay
  const handlePlayVoice = () => {
    if (!analysisResult) return;
    const script = analysisResult.speechScripts[selectedLanguage] || analysisResult.speechScripts['en-IN'];
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

  const handlePauseVoice = () => speechAssistant.pause();
  const handleReplayVoice = () => speechAssistant.replay();

  const handleResetWizard = () => {
    speechAssistant.stop();
    setImagePreviewUrl(null);
    setSelectedImageSource(null);
    setSelectedSampleId(null);
    setExtractedText('');
    setAnalysisResult(null);
    setIsSaved(false);
    setIsBlurryOrUnreadable(false);
    stopCameraStream();
    setCurrentStep(1);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSaveScan = () => {
    if (onSaveHistory && analysisResult) {
      onSaveHistory(analysisResult);
      setIsSaved(true);
    }
  };

  // Helper for filter card renderer used in both Step 1 and Step 2
  const renderFilterPanel = (title, subtitle) => (
    <div id="food-filters-panel" className={`p-5 sm:p-6 rounded-3xl border space-y-4 scroll-mt-24 transition-all ${
      isDarkMode
        ? 'bg-slate-800/80 border-slate-700/80'
        : 'bg-blue-50/60 border-blue-200/80'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className={`font-extrabold text-base sm:text-lg flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-blue-950'
          }`}>
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span>{title}</span>
          </h3>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilterIds(PERSONALIZED_FILTERS.map((f) => f.id))}
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilterIds([])}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Meesho-Style Filter Cards Grid (Selectable Cards & Switches) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PERSONALIZED_FILTERS.map((filter) => {
          const isSelected = selectedFilterIds.includes(filter.id);
          return (
            <div
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none active:scale-[0.99] ${
                isSelected
                  ? isDarkMode
                    ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30 shadow-md text-white'
                    : 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-sm text-slate-900'
                  : isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
            >
              {/* Toggle Switch Checkbox */}
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : isDarkMode
                  ? 'border-slate-600 bg-slate-800'
                  : 'border-slate-300 bg-white'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`font-extrabold text-xs sm:text-sm truncate flex items-center gap-1.5 ${
                    isSelected ? (isDarkMode ? 'text-blue-300' : 'text-blue-900') : (isDarkMode ? 'text-slate-200' : 'text-slate-800')
                  }`}>
                    <span>{filter.icon}</span>
                    <span className="truncate">{filter.name}</span>
                  </p>
                </div>
                <p className={`text-[11px] font-bold mt-0.5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {filter.localKn}
                </p>
                <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {filter.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informational Preference Disclaimer */}
      <p className={`text-xs italic pt-1 flex items-center gap-1.5 ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        <Info className="w-3.5 h-3.5 shrink-0 text-blue-500" />
        <span>* Note: These filters represent informational preferences, not medical diagnoses.</span>
      </p>
    </div>
  );

  return (
    <div id="scanner-wizard" className="w-full scroll-mt-24 space-y-6">
      {/* 3 Main Stages Flow Banner: 1. CAPTURE IT → 2. KNOW YOUR FOOD → 3. LISTEN IN YOUR LANGUAGE */}
      <div className={`p-3.5 sm:p-4 rounded-3xl border transition-all ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white shadow-lg'
          : 'bg-white border-blue-100 shadow-sm text-slate-800'
      }`}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Step 1: Capture It */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : isDarkMode
                ? 'text-slate-400 hover:text-blue-400'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
            }`}>
              1
            </span>
            <span className="hidden xs:inline">1.</span>
            <span>CAPTURE IT</span>
          </button>

          <div className="w-4 sm:w-12 h-[2px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Step 2: Know Your Food */}
          <button
            onClick={() => (extractedText || selectedSampleId) && setCurrentStep(2)}
            disabled={!extractedText && !selectedSampleId}
            className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : isDarkMode
                ? 'text-slate-400 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed'
                : 'text-slate-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </span>
            <span className="hidden xs:inline">2.</span>
            <span>KNOW YOUR FOOD</span>
          </button>

          <div className="w-4 sm:w-12 h-[2px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Step 3: Listen in Your Language */}
          <button
            onClick={() => analysisResult && setCurrentStep(3)}
            disabled={!analysisResult}
            className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : isDarkMode
                ? 'text-slate-400 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed'
                : 'text-slate-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
            }`}>
              3
            </span>
            <span className="hidden xs:inline">3.</span>
            <span>LISTEN</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: CAPTURE IT — SCAN OR UPLOAD
         ======================================================== */}
      {currentStep === 1 && (
        <div className={`p-5 sm:p-8 rounded-3xl border transition-all space-y-6 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl'
            : 'bg-white border-blue-100 shadow-lg text-slate-800'
        }`}>
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
              Stage 1 of 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-['Outfit',sans-serif]">
              Capture It — Scan or Upload
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Photograph the ingredient or nutritional table on your packaged food, or upload an image file from your device.
            </p>
          </div>

          {/* 1-Tap Sample Food Shelf for Immediate Testing */}
          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-blue-50/60 border-blue-100'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Or select a sample food product to test instantly:</span>
              </span>
              <span className={`text-[11px] hidden sm:inline ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                1-click test
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {SAMPLE_LABELS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-blue-50 shadow-sm'
                    }`}
                  >
                    <p className="text-xs font-bold truncate">{sample.title}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${
                      isSelected ? 'text-blue-100' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {sample.category}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option A: Live Camera Stream View */}
          {isLiveCameraOpen ? (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-4/3 max-w-md mx-auto flex flex-col items-center justify-center border-2 border-blue-500 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-6 border-2 border-dashed border-blue-400/70 rounded-2xl pointer-events-none"></div>
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl pointer-events-none">
                <span>Align label text within the frame</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="absolute bottom-5 flex items-center gap-3">
                <button
                  onClick={capturePhotoFromStream}
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCameraStream}
                  className="px-4 py-2.5 rounded-full bg-slate-800/90 text-white text-xs font-bold backdrop-blur-md cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : imagePreviewUrl ? (
            /* Selected Food Label Preview with Retake and Remove options */
            <div className="max-w-md mx-auto space-y-3">
              <div className={`relative rounded-3xl overflow-hidden border aspect-4/3 flex items-center justify-center shadow-md ${
                isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-blue-200 bg-slate-50'
              }`}>
                <img
                  src={imagePreviewUrl}
                  alt="Food Label Preview"
                  className="w-full h-full object-contain p-3"
                />

                {isProcessingOcr && (
                  <div className="absolute inset-0 bg-blue-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-5 space-y-2">
                    <RefreshCw className="w-8 h-8 text-blue-300 animate-spin" />
                    <p className="text-sm font-extrabold">{ocrStatusText}</p>
                    <div className="w-48 h-2 bg-blue-900 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-blue-400 transition-all duration-300 rounded-full"
                        style={{ width: `${ocrProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Retake and Remove Action Buttons (Strictly matching prompt) */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      isDarkMode
                        ? 'border-blue-500/40 text-blue-300 hover:bg-blue-900/30'
                        : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>

                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {extractedText && (
                  <span className={`font-mono text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {extractedText.split(/\s+/).filter(Boolean).length} words read
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Two Clearly Visible Options: Option A (Capture Image) & Option B (Upload Image) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {/* Option A: Capture Image */}
              <div
                onClick={() => {
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    startCameraStream();
                  } else if (cameraInputRef.current) {
                    cameraInputRef.current.click();
                  }
                }}
                className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isDarkMode
                    ? 'border-blue-500/40 bg-slate-800/60 hover:bg-slate-800 text-white'
                    : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-1 inline-block">
                    Option A
                  </span>
                  <h4 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Capture Image
                  </h4>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Open device camera to photograph the food label
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                      startCameraStream();
                    } else if (cameraInputRef.current) {
                      cameraInputRef.current.click();
                    }
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Open Camera</span>
                </button>
              </div>

              {/* Option B: Upload Image */}
              <div
                onClick={() => {
                  if (galleryInputRef.current) {
                    galleryInputRef.current.click();
                  }
                }}
                className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isDarkMode
                    ? 'border-blue-500/40 bg-slate-800/60 hover:bg-slate-800 text-white'
                    : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-slate-800 shadow-sm'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 mb-1 inline-block">
                    Option B
                  </span>
                  <h4 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Upload Image
                  </h4>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select a JPG, JPEG, or PNG from phone or computer
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (galleryInputRef.current) galleryInputRef.current.click();
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {cameraError && (
            <p className="text-center text-xs text-amber-600 font-semibold">{cameraError}</p>
          )}

          {/* Blurry / Text Unidentifiable Warning Notice */}
          {isBlurryOrUnreadable && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 max-w-lg mx-auto flex items-start gap-3 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Image is blurry or label text cannot be identified</p>
                <p className="mt-0.5">
                  The text on the packet could not be read clearly. Please <strong>retake the photo</strong> under good lighting, hold your phone steady, or upload a clearer image.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Retake Now
                  </button>
                  <button
                    onClick={() => {
                      if (galleryInputRef.current) galleryInputRef.current.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-400 text-amber-800 font-bold text-xs cursor-pointer"
                  >
                    Upload Another Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Personalized Food Filters Panel (Selectable BEFORE Analysis - Required by prompt) */}
          {renderFilterPanel(
            'Personalized Food Filters (Select Before Analysis)',
            'Choose your dietary preferences and health goals. These will be evaluated when you understand your food.'
          )}

          {/* Prominent “Understand My Food” Button (Strictly matching prompt) */}
          {(extractedText || selectedSampleId) && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleUnderstandMyFood}
                disabled={isProcessingOcr}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-xl shadow-blue-500/25 active:scale-95 transition-all cursor-pointer ring-4 ring-blue-500/20"
              >
                <span>Understand My Food</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          STAGE 2: KNOW YOUR FOOD — PERSONALIZED ANALYSIS
         ======================================================== */}
      {currentStep === 2 && analysisResult && (
        <div className={`p-5 sm:p-8 rounded-3xl border transition-all space-y-6 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl'
            : 'bg-white border-blue-100 shadow-lg text-slate-800'
        }`}>
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
              Stage 2 of 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-['Outfit',sans-serif]">
              Know Your Food — Personalized Analysis
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Clear breakdown of ingredients, nutritional values, and personalized warnings based on your preferences.
            </p>
          </div>

          {/* Overall Health & Safety Verdict Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            analysisResult.status === 'flagged'
              ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
              : analysisResult.status === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {analysisResult.status === 'flagged' ? (
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
              ) : analysisResult.status === 'warning' ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="font-extrabold text-base">{analysisResult.verdict}</p>
                <p className="text-xs opacity-85">
                  Evaluated against {selectedFilterIds.length} personal dietary filters
                </p>
              </div>
            </div>

            <div className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-current">
              {analysisResult.status === 'flagged' ? 'Attention Needed' : analysisResult.status === 'warning' ? 'Check Dates' : 'Filters Passed'}
            </div>
          </div>

          {/* Triggered Dietary Warnings (Contextual Warning Banners) */}
          {analysisResult.flaggedWarnings && analysisResult.flaggedWarnings.length > 0 && (
            <div className="space-y-3">
              <h3 className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 ${
                isDarkMode ? 'text-rose-400' : 'text-rose-800'
              }`}>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Dietary Warnings Based on Selected Filters:</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {analysisResult.flaggedWarnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-100 flex items-start gap-3 shadow-sm"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{warn.icon}</span>
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm sm:text-base">
                        {warn.warningMessage}
                      </p>
                      <p className="text-xs font-semibold font-['Noto_Sans_Kannada',sans-serif] text-rose-800 dark:text-rose-300">
                        {warn.warningMessageKn}
                      </p>
                      {warn.matchedKeywords && warn.matchedKeywords.length > 0 && (
                        <p className="text-[11px] text-rose-700 dark:text-rose-300">
                          Detected keywords: <strong>{warn.matchedKeywords.join(', ')}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Filter Panel in Step 2 to toggle on the fly */}
          {renderFilterPanel(
            'Personalized Food Filters (Tap to Toggle)',
            'Warnings update dynamically in real time when you change your filters.'
          )}

          {/* Expiry Date Card if detected */}
          {analysisResult.dateInfo && analysisResult.dateInfo.hasDates && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
              analysisResult.dateInfo.expiryDate?.status === 'expired'
                ? 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                : 'bg-blue-50/60 border-blue-200 text-blue-950 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-75">
                    Expiry / Best Before Date:
                  </span>
                  <p className="text-sm font-extrabold">
                    {analysisResult.dateInfo.expiryDate?.formatted || 'Date Identified'}
                  </p>
                  <p className="text-[11px] font-medium opacity-90">
                    {analysisResult.dateInfo.expiryDate?.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Table (Displayed ONLY when reliably extracted from label) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`font-extrabold text-sm flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <span>Nutritional Values (Extracted from Label)</span>
              </h3>
              <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                WHO / FSSAI Guidelines
              </span>
            </div>

            {analysisResult.nutrition && analysisResult.nutrition.hasNutrition ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Calories / Energy */}
                {analysisResult.nutrition.energy !== null && (
                  <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Energy</span>
                    <p className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {analysisResult.nutrition.energy} <span className="text-xs font-semibold">kcal</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Per 100g</span>
                  </div>
                )}

                {/* Sugar Highlight */}
                {analysisResult.nutrition.sugar !== null && (
                  <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                    analysisResult.nutrition.sugarTraffic === 'high'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                      : analysisResult.nutrition.sugarTraffic === 'medium'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold">Total Sugar</span>
                    <p className="text-lg font-extrabold">
                      {analysisResult.nutrition.sugar} <span className="text-xs font-semibold">g</span>
                    </p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                      analysisResult.nutrition.sugarTraffic === 'high'
                        ? 'bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-100'
                        : analysisResult.nutrition.sugarTraffic === 'medium'
                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                        : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                    }`}>
                      {analysisResult.nutrition.sugarTraffic.toUpperCase()} SUGAR
                    </span>
                  </div>
                )}

                {/* Fat / Saturated Fat */}
                {analysisResult.nutrition.fat !== null && (
                  <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                    analysisResult.nutrition.satFatTraffic === 'high'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                      : analysisResult.nutrition.satFatTraffic === 'medium'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold">Total Fat</span>
                    <p className="text-lg font-extrabold">
                      {analysisResult.nutrition.fat} <span className="text-xs font-semibold">g</span>
                    </p>
                    <span className="text-[10px] font-medium opacity-80">
                      {analysisResult.nutrition.satFat !== null ? `Sat: ${analysisResult.nutrition.satFat}g` : 'Fats'}
                    </span>
                  </div>
                )}

                {/* Sodium / Salt Highlight */}
                {analysisResult.nutrition.sodium !== null && (
                  <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                    analysisResult.nutrition.sodiumTraffic === 'high'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                      : analysisResult.nutrition.sodiumTraffic === 'medium'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold">Sodium (Salt)</span>
                    <p className="text-lg font-extrabold">
                      {analysisResult.nutrition.sodium} <span className="text-xs font-semibold">mg</span>
                    </p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                      analysisResult.nutrition.sodiumTraffic === 'high'
                        ? 'bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-100'
                        : analysisResult.nutrition.sodiumTraffic === 'medium'
                        ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                        : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                    }`}>
                      {analysisResult.nutrition.sodiumTraffic.toUpperCase()} SALT
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border text-xs text-center ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                Nutritional table was not clearly printed on this portion of the label. Only verified information is shown.
              </div>
            )}
          </div>

          {/* Understand the Ingredients: Plain-Language Explanations */}
          <div className="space-y-3">
            <h3 className={`font-extrabold text-sm flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Understand the Ingredients (Explained in Plain Words)</span>
            </h3>

            {analysisResult.majorIngredients && analysisResult.majorIngredients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisResult.majorIngredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isDarkMode
                        ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {ing.simpleName}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {ing.category}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {ing.explanation}
                    </p>
                    {ing.healthImpact && (
                      <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        💡 {ing.healthImpact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Raw label text processed. Expand raw text below for unformatted words.
              </p>
            )}
          </div>

          {/* Uncertainty & Safety Disclaimer (Mandatory Requirement) */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
            isDarkMode
              ? 'bg-blue-950/40 border-blue-800 text-blue-200'
              : 'bg-blue-50/70 border-blue-200 text-blue-900'
          }`}>
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Important Safety Notice:</strong> Never assume a product is completely safe or unsafe based only on incomplete label information. If an ingredient or allergen cannot be confirmed from this photo, the information remains uncertain. Always check physical packaging before consumption.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl border text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                isDarkMode
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Photo & Filters</span>
            </button>

            <button
              onClick={handleGoToVoiceStep}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen in Your Language</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 3: LISTEN IN YOUR LOCAL LANGUAGE
         ======================================================== */}
      {currentStep === 3 && analysisResult && (
        <div id="language-voice-section" className={`p-5 sm:p-8 rounded-3xl border transition-all space-y-6 scroll-mt-24 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl'
            : 'bg-white border-blue-100 shadow-lg text-slate-800'
        }`}>
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
              Stage 3 of 3
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-['Outfit',sans-serif]">
              Listen in Your Local Language
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Clear spoken voice explanation of major ingredients, nutritional values, allergens, and dietary warnings.
            </p>
          </div>

          {/* Prominent Voice Assistant Hub */}
          <div className={`p-5 sm:p-7 rounded-3xl border space-y-5 ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-blue-50/80 border-blue-200'
          }`}>
            {/* Language Selector Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-200/60 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
                    Voice Assistant
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Natural text-to-speech explanation
                  </p>
                </div>
              </div>

              {/* Language Dropdown (Kannada, Hindi, English, Tamil, Telugu) */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Language:
                </span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    speechAssistant.stop();
                    setSelectedLanguage(e.target.value);
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-extrabold shadow-sm cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-white border-blue-300 text-blue-900'
                  }`}
                >
                  {LOCAL_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio Controls: Play, Pause, and Replay (Strictly matching prompt) */}
            <div className="flex flex-wrap items-center gap-3">
              {speechState === 'playing' ? (
                <button
                  onClick={handlePauseVoice}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handlePlayVoice}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Listen to Explanation ({LOCAL_LANGUAGES.find((l) => l.code === selectedLanguage)?.nativeName})</span>
                </button>
              )}

              {/* Replay Button */}
              <button
                onClick={handleReplayVoice}
                className={`flex items-center gap-1.5 px-4 py-3.5 rounded-2xl border font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-white border-blue-200 text-blue-800 hover:bg-blue-50'
                }`}
                title="Restart audio from beginning"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>

              {/* Playback speed selector */}
              <div className={`flex items-center gap-1 ml-auto text-xs font-semibold ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span>Speed:</span>
                {[0.8, 1.0, 1.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeechSpeed(rate);
                      if (speechState === 'playing') {
                        speechAssistant.replay();
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border cursor-pointer ${
                      speechSpeed === rate
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Live Indicator when audio is playing */}
            {speechState === 'playing' && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                <span>Speaking explanation in {LOCAL_LANGUAGES.find((l) => l.code === selectedLanguage)?.name}...</span>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="w-1 h-3 bg-blue-500 rounded-full animate-pulse-bar-1"></span>
                  <span className="w-1 h-5 bg-blue-500 rounded-full animate-pulse-bar-2"></span>
                  <span className="w-1 h-2 bg-blue-500 rounded-full animate-pulse-bar-3"></span>
                  <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse-bar-4"></span>
                </div>
              </div>
            )}

            {/* Transcript Card in Local Script */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-2 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-blue-100 text-slate-800'
            }`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Spoken Transcript ({LOCAL_LANGUAGES.find((l) => l.code === selectedLanguage)?.name}):
              </span>
              <p className="text-sm sm:text-base leading-relaxed font-['Noto_Sans_Kannada',sans-serif]">
                {analysisResult.speechScripts[selectedLanguage] || analysisResult.speechScripts['en-IN']}
              </p>
            </div>
          </div>

          {/* Optional Raw OCR Text Accordion */}
          <div className="pt-1">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{showRawText ? 'Hide extracted packaging text' : 'View extracted packaging text (Optional)'}</span>
              {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawText && (
              <div className={`mt-2.5 p-4 rounded-2xl border text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {analysisResult.rawText}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <button
              onClick={handleResetWizard}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan Another Food</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveScan}
                disabled={isSaved}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isSaved ? 'Saved to History' : 'Save Scan'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
