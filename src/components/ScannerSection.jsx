import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { SAMPLE_LABELS } from '../data/ingredientsData';
import {
  Upload, Camera, Image as ImageIcon, Sparkles, AlertCircle,
  RefreshCw, CheckCircle2, FileText, Edit3, X, Sliders, ChevronRight
} from 'lucide-react';

export default function ScannerSection({ onScanComplete, initialFilters }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState({ status: '', progress: 0 });
  const [extractedText, setExtractedText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Unable to access device camera. Please check camera permissions or upload an image file.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setImagePreviewUrl(dataUrl);
    setSelectedImage({ type: 'camera', dataUrl });
    setSelectedSampleId(null);
    stopCamera();
    processOcrOnImage(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
    setSelectedImage(file);
    setSelectedSampleId(null);
    stopCamera();
    processOcrOnImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
      setSelectedImage(file);
      setSelectedSampleId(null);
      stopCamera();
      processOcrOnImage(file);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedSampleId(sample.id);
    setImagePreviewUrl(sample.image);
    setSelectedImage({ type: 'sample', sample });
    setExtractedText(sample.simulatedText);
    stopCamera();
  };

  // High quality client-side OCR using Tesseract.js with Canvas preprocessing
  const processOcrOnImage = async (imageSource) => {
    setIsProcessingOcr(true);
    setOcrProgress({ status: 'Preprocessing food label image...', progress: 10 });

    try {
      // Create offscreen image for canvas contrast optimization
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        img.src = URL.createObjectURL(imageSource);
      }

      await loadPromise;

      // Canvas preprocessing (Grayscale + High Contrast for sharp font OCR)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Enhance text contrast
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const contrastFactor = 1.35;
        const enhanced = (avg - 128) * contrastFactor + 128;
        const finalVal = Math.min(255, Math.max(0, enhanced));
        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
      }
      ctx.putImageData(imgData, 0, 0);
      const optimizedImageUrl = canvas.toDataURL('image/jpeg', 0.95);

      setOcrProgress({ status: 'Loading OCR Engine...', progress: 30 });

      // Initialize Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress({
              status: `Optical Scanning: ${Math.round(m.progress * 100)}%`,
              progress: 30 + Math.round(m.progress * 65)
            });
          }
        }
      });

      const ret = await worker.recognize(optimizedImageUrl);
      await worker.terminate();

      const recognized = ret.data.text.trim();
      setExtractedText(recognized || 'No clear text detected on label. Please check photo angle or contrast.');
      setOcrProgress({ status: 'Scan Complete', progress: 100 });
    } catch (err) {
      console.error('OCR Processing error:', err);
      // Fallback
      setExtractedText('Unable to complete OCR. Please try re-taking the photo or enter/edit the text manually below.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (!extractedText.trim()) {
      alert('Please upload a food label photo or choose one of the sample labels to analyze.');
      return;
    }
    onScanComplete({
      rawText: extractedText,
      imageSource: imagePreviewUrl,
      sampleId: selectedSampleId
    });
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setExtractedText('');
    setSelectedSampleId(null);
    setIsEditingText(false);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="scanner-section" className="w-full space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B4332]/80 border border-[#52B788]/30 text-xs font-semibold text-[#74C69D]">
          <Camera className="w-3.5 h-3.5" />
          <span>Interactive Food Label Scanner</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAF9F6] tracking-tight">
          Upload Packaging Photo or Try a Sample
        </h2>
        <p className="text-sm sm:text-base text-[#D8F3DC]/70">
          Our high-accuracy OCR extracts ingredient lists, expiry dates, and allergen disclosures in seconds.
        </p>
      </div>

      {/* 1-Click Sample Labels Picker */}
      <div className="glass-panel rounded-3xl p-6 border border-[#52B788]/20">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E9B949]" />
            <h4 className="text-sm font-bold text-[#FAF9F6] uppercase tracking-wider">
              1-Click Demo Samples (Instant Evaluation)
            </h4>
          </div>
          <span className="text-xs text-[#D8F3DC]/60 hidden sm:inline">
            Click any packaged product to test instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SAMPLE_LABELS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#1B4332] border-[#52B788] ring-2 ring-[#52B788]/60 shadow-lg shadow-[#52B788]/20'
                    : 'bg-[#0E291E]/70 border-[#52B788]/20 hover:bg-[#12372A] hover:border-[#52B788]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0B1E16] text-[#74C69D] font-medium border border-[#52B788]/30">
                    {sample.category}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#52B788]" />}
                </div>
                <h5 className="font-bold text-sm text-[#FAF9F6] group-hover:text-[#74C69D] transition-colors line-clamp-1">
                  {sample.title}
                </h5>
                <p className="text-[11px] text-[#D8F3DC]/60 mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload & Scanner Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#52B788]/25 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Area / Camera Stream */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#52B788] uppercase tracking-wider">
                Photo Input
              </span>
              {imagePreviewUrl && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove & Retake
                </button>
              )}
            </div>

            {/* Camera View */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-[#000] border-2 border-[#52B788] aspect-4/3 flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder crosshairs */}
                <div className="absolute inset-8 border border-[#52B788]/50 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-[1px] bg-[#52B788]/40 animate-scan-laser"></div>
                </div>

                <div className="absolute bottom-4 flex items-center gap-3">
                  <button
                    onClick={captureCameraPhoto}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#52B788] hover:bg-[#74C69D] text-[#0B1E16] font-bold text-sm shadow-xl transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Snap Food Label
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-[#1B4332]/90 hover:bg-[#2D6A4F] text-[#FAF9F6] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreviewUrl ? (
              /* Image Preview with Scanning Animation */
              <div className="relative rounded-2xl overflow-hidden border border-[#52B788]/30 bg-[#0B1E16]/80 aspect-4/3 flex items-center justify-center group">
                <img
                  src={imagePreviewUrl}
                  alt="Food Label Preview"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback visually if sample image asset is placeholder
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-gradient-to-br', 'from-[#1B4332]', 'to-[#0B1E16]');
                  }}
                />

                {/* Simulated Label Canvas Preview for samples */}
                {selectedSampleId && (
                  <div className="absolute inset-4 rounded-xl border border-[#52B788]/30 bg-[#FAF9F6]/95 text-[#0B1E16] p-4 text-xs font-mono overflow-auto shadow-inner">
                    <div className="font-bold border-b border-neutral-300 pb-1 mb-2 text-neutral-800 flex justify-between items-center">
                      <span>PACKAGING INSPECTOR</span>
                      <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">SAMPLE</span>
                    </div>
                    <p className="whitespace-pre-line text-[11px] leading-relaxed text-neutral-700">
                      {SAMPLE_LABELS.find(s => s.id === selectedSampleId)?.simulatedText}
                    </p>
                  </div>
                )}

                {/* Laser animation while OCR is working */}
                {isProcessingOcr && (
                  <div className="absolute inset-0 pointer-events-none bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-[#52B788] shadow-[0_0_15px_#52B788] animate-scan-laser absolute"></div>
                    <div className="bg-[#0B1E16]/90 border border-[#52B788] px-5 py-3 rounded-2xl flex flex-col items-center gap-2 shadow-2xl">
                      <RefreshCw className="w-6 h-6 text-[#52B788] animate-spin" />
                      <p className="text-xs font-bold text-[#52B788]">{ocrProgress.status}</p>
                      <div className="w-40 h-2 bg-[#1B4332] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#52B788] transition-all duration-300"
                          style={{ width: `${ocrProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Dropzone & Camera Launcher */
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="rounded-2xl border-2 border-dashed border-[#52B788]/35 hover:border-[#52B788] bg-[#0E291E]/50 hover:bg-[#12372A]/70 transition-all p-8 text-center cursor-pointer aspect-4/3 flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1B4332] flex items-center justify-center text-[#52B788] group-hover:scale-110 group-hover:bg-[#2D6A4F] transition-all border border-[#52B788]/30 shadow-lg">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base text-[#FAF9F6]">
                    Click to upload or drag & drop photo
                  </p>
                  <p className="text-xs text-[#D8F3DC]/60 mt-1">
                    Supports high-resolution PNG, JPG, or WEBP food labels
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-xs font-semibold text-[#74C69D] border border-[#52B788]/30 transition-colors shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Use Live Camera
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Right Column: OCR Extracted Text & Inspection */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#52B788]" />
                <span className="text-xs font-semibold text-[#52B788] uppercase tracking-wider">
                  Extracted Label Text (Optical OCR)
                </span>
              </div>

              {extractedText && (
                <button
                  onClick={() => setIsEditingText(!isEditingText)}
                  className="flex items-center gap-1 text-xs text-[#74C69D] hover:text-[#52B788] font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingText ? 'Done Editing' : 'Edit / Refine'}
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-[#52B788]/25 bg-[#0B1E16]/80 p-4 min-h-[220px] max-h-[320px] overflow-y-auto flex flex-col justify-between">
              {isEditingText ? (
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Review or manually edit extracted packaging text here..."
                  className="w-full h-48 bg-transparent text-xs text-[#FAF9F6] font-mono resize-none focus:outline-none"
                />
              ) : extractedText ? (
                <div className="space-y-2">
                  <p className="text-xs text-[#FAF9F6]/90 font-mono whitespace-pre-wrap leading-relaxed">
                    {extractedText}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#D8F3DC]/40 space-y-2">
                  <FileText className="w-8 h-8 stroke-1 text-[#52B788]/40" />
                  <p className="text-xs">
                    Extracted text will appear here once you take a photo, upload an image, or click one of the demo samples above.
                  </p>
                </div>
              )}

              {extractedText && (
                <div className="pt-3 border-t border-[#52B788]/15 flex items-center justify-between text-[11px] text-[#D8F3DC]/60">
                  <span>{extractedText.split(/\s+/).filter(Boolean).length} words detected</span>
                  <span className="text-[#52B788] font-medium">Ready for rule analysis</span>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleAnalyzeClick}
              disabled={!extractedText || isProcessingOcr}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                extractedText && !isProcessingOcr
                  ? 'bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#52B788] hover:scale-[1.01] active:scale-[0.99] text-[#FAF9F6] shadow-[#52B788]/30 hover:shadow-[#52B788]/50 cursor-pointer'
                  : 'bg-[#1B4332]/40 text-[#D8F3DC]/30 cursor-not-allowed border border-[#52B788]/10'
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#E9B949]" />
              <span>Analyze Food Label & Check Filters</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
