// AharaBimba Web Speech Synthesis & Natural Local Voice Assistant Engine
// Full support for Kannada, Hindi, English, Tamil, and Telugu with Replay & Rate controls

class VoiceAssistant {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.lastConfig = null;
    this.voices = [];
    this.isSupported = Boolean(this.synth);
    this.listeners = new Set();
    this.state = 'idle'; // 'idle' | 'playing' | 'paused'

    if (this.isSupported) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices();
    } catch (e) {
      console.warn('Could not load speech voices:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('Error notifying speech listener:', e);
      }
    });
  }

  getBestVoiceForLanguage(langCode) {
    this.loadVoices();
    if (!this.voices || this.voices.length === 0) return null;

    const baseLang = langCode.split('-')[0].toLowerCase();

    // 1. Exact match (e.g. kn-IN, hi-IN, ta-IN, te-IN, en-IN)
    let matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase() === langCode.toLowerCase()
    );
    if (matched) return matched;

    // 2. Language prefix match (e.g. kn, hi, ta, te)
    matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(baseLang)
    );
    if (matched) return matched;

    // 3. Indian English / Indian regional fallback
    matched = this.voices.find(
      (v) => v.lang && (v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india'))
    );
    if (matched) return matched;

    // 4. Default voice
    return this.voices.find((v) => v.default) || this.voices[0];
  }

  speak({ text, lang = 'kn-IN', rate = 1.0, pitch = 1.0, onStart, onEnd, onError }) {
    if (!this.isSupported || !text) {
      if (onError) onError('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();
    this.lastConfig = { text, lang, rate, pitch };

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = this.getBestVoiceForLanguage(lang);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        this.state = 'playing';
        this.notify({ type: 'start', state: 'playing', lang, text });
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.state = 'idle';
        this.currentUtterance = null;
        this.notify({ type: 'end', state: 'idle' });
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        // 'interrupted' or 'canceled' are normal when user taps Stop/Pause/Replay
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', event.error);
        }
        this.state = 'idle';
        this.currentUtterance = null;
        this.notify({ type: 'error', error: event.error, state: 'idle' });
        if (onError) onError(event.error);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Could not trigger speech synthesis:', err);
      this.state = 'idle';
      this.notify({ type: 'error', error: err, state: 'idle' });
    }
  }

  pause() {
    if (this.synth && this.state === 'playing') {
      try {
        this.synth.pause();
        this.state = 'paused';
        this.notify({ type: 'pause', state: 'paused' });
      } catch (e) {
        console.warn('Error pausing speech:', e);
      }
    }
  }

  resume() {
    if (this.synth && this.state === 'paused') {
      try {
        this.synth.resume();
        this.state = 'playing';
        this.notify({ type: 'resume', state: 'playing' });
      } catch (e) {
        console.warn('Error resuming speech:', e);
      }
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('Error cancelling speech:', e);
      }
      this.state = 'idle';
      this.currentUtterance = null;
      this.notify({ type: 'stop', state: 'idle' });
    }
  }

  replay() {
    if (this.lastConfig) {
      this.stop();
      // Slight timeout to let cancel settle
      setTimeout(() => {
        this.speak(this.lastConfig);
      }, 60);
    }
  }
}

export const speechAssistant = new VoiceAssistant();
