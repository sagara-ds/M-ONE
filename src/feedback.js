// Optional feedback only: the written instructions remain available without audio.
const SOUNDS = {
  click: [[740, 0, 0.055]],
  move: [[440, 0, 0.08], [554, 0.065, 0.08]],
  turn: [[554, 0, 0.075], [659, 0.065, 0.09]],
  pickup: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.12]],
  deliver: [[659, 0, 0.1], [784, 0.09, 0.1], [1047, 0.18, 0.15]],
  hint: [[523, 0, 0.13], [659, 0.12, 0.16]],
  reset: [[659, 0, 0.08], [440, 0.08, 0.12]],
  success: [[523, 0, 0.13], [659, 0.12, 0.13], [784, 0.24, 0.13], [1047, 0.36, 0.24]],
  error: [[330, 0, 0.14], [294, 0.13, 0.17]],
};

const browser = () => (typeof window === 'undefined' ? globalThis : window);
const pageHidden = () => typeof document !== 'undefined' && document.hidden;

export class FeedbackEngine {
  constructor({ onUnavailable } = {}) {
    this.options = { sound: false, voice: false, volume: 0.35 };
    this.onUnavailable = typeof onUnavailable === 'function' ? onUnavailable : () => {};
    this.context = null;
    this.master = null;
    this.tones = new Set();
    this.notified = new Set();
    this.speechToken = 0;
    this.speechTimer = null;
    this.voiceListener = null;
    this.utterance = null;
    // Importing this module in Node requires no browser globals.
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stop();
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => this.stop());
    }
  }

  setOptions(options = {}) {
    const previous = this.options;
    const next = { ...previous };
    if (typeof options.sound === 'boolean') next.sound = options.sound;
    if (typeof options.voice === 'boolean') next.voice = options.voice;
    if (typeof options.volume === 'number' && Number.isFinite(options.volume)) {
      next.volume = Math.min(1, Math.max(0, options.volume));
    }
    this.options = next;
    if (next.sound && !previous.sound) this.notified.delete('sound');
    if (next.voice && !previous.voice) this.notified.delete('voice');
    if (!next.sound || next.volume === 0) this._stopAudio();
    // Browsers do not reliably change the volume of speech already underway.
    // Cancel it on a volume change; the next short narration uses the new value.
    if (!next.voice || next.volume !== previous.volume) this.stopSpeech();
    this._setMasterVolume();
  }

  // Call directly in a click/touch handler, before awaiting other work.
  // AudioContext creation and resume happen only after the user enabled sound.
  unlock() {
    if (!this.options.sound || this.options.volume === 0 || pageHidden()) {
      return Promise.resolve(false);
    }
    try {
      if (!this.context || this.context.state === 'closed') {
        const AudioContext = browser().AudioContext || browser().webkitAudioContext;
        if (!AudioContext) {
          this._unavailable('sound', 'Bunyi belum tersedia di perangkat ini. Kamu tetap bisa bermain.');
          return Promise.resolve(false);
        }
        const context = new AudioContext();
        try {
          const master = context.createGain();
          master.connect(context.destination);
          this.context = context;
          this.master = master;
        } catch (error) {
          // Avoid retaining a partially initialized context after an API failure.
          try { Promise.resolve(context.close()).catch(() => {}); } catch { /* Optional cleanup. */ }
          throw error;
        }
        this._setMasterVolume();
      }
      const resume = this.context.state === 'running' ? undefined : this.context.resume();
      return Promise.resolve(resume).then(() => this.context.state === 'running').catch(() => {
        this._unavailable('sound', 'Bunyi belum bisa diputar. Coba aktifkan bunyi sekali lagi.');
        return false;
      });
    } catch {
      this._unavailable('sound', 'Bunyi belum bisa diputar. Kamu tetap bisa bermain.');
      return Promise.resolve(false);
    }
  }

  play(type) {
    const notes = SOUNDS[type];
    if (!notes || !this.options.sound || this.options.volume === 0 || pageHidden()
      || !this.context || this.context.state !== 'running' || !this.master) return false;
    // Replace the previous cue instead of allowing repeated taps to build a queue.
    this._stopAudio();
    try {
      const start = this.context.currentTime + 0.005;
      for (const [frequency, offset, duration] of notes) {
        const oscillator = this.context.createOscillator();
        const envelope = this.context.createGain();
        const tone = { oscillator, envelope };
        this.tones.add(tone);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start + offset);
        envelope.gain.setValueAtTime(0.0001, start + offset);
        envelope.gain.exponentialRampToValueAtTime(0.07, start + offset + 0.012);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + offset + duration);
        oscillator.connect(envelope);
        envelope.connect(this.master);
        oscillator.onended = () => this._removeTone(tone);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + duration + 0.015);
      }
      return true;
    } catch {
      this._stopAudio();
      this._unavailable('sound', 'Bunyi belum bisa diputar. Kamu tetap bisa bermain.');
      return false;
    }
  }

  speak(text) {
    this.stopSpeech();
    if (!this.options.voice || this.options.volume === 0 || pageHidden()
      || typeof text !== 'string' || !text.trim()) return false;
    const host = browser();
    const synth = host.speechSynthesis;
    if (!synth || !host.SpeechSynthesisUtterance) {
      this._unavailable('voice', 'Bacaan suara belum tersedia. Ikuti teks petunjuk di layar.');
      return false;
    }
    // Keep step narration short. Longer explanations stay readable on screen.
    const normalized = text.replace(/\s+/g, ' ').trim();
    const shortText = normalized.length <= 180 ? normalized
      : normalized.slice(0, 180).replace(/\s+\S*$/, '').replace(/[,;:]$/, '') + '.';
    const token = this.speechToken;
    const read = () => {
      if (token !== this.speechToken || !this.options.voice || pageHidden()) return false;
      try {
        const voice = synth.getVoices().find((item) => /^id(?:[-_]|$)/i.test(item.lang));
        if (!voice) {
          this._unavailable('voice', 'Suara bahasa Indonesia belum tersedia. Ikuti teks petunjuk di layar.');
          return false;
        }
        const utterance = new host.SpeechSynthesisUtterance(shortText);
        utterance.voice = voice;
        utterance.lang = 'id-ID';
        utterance.volume = this.options.volume;
        utterance.rate = 0.94;
        utterance.pitch = 1.05;
        utterance.onend = () => {
          if (this.utterance === utterance) this.utterance = null;
        };
        utterance.onerror = (event) => {
          if (this.utterance === utterance) this.utterance = null;
          if (token === this.speechToken && !['canceled', 'interrupted'].includes(event.error)) {
            this._unavailable('voice', 'Bacaan suara belum bisa diputar. Ikuti teks petunjuk di layar.');
          }
        };
        this.utterance = utterance;
        synth.speak(utterance);
        return true;
      } catch {
        this._unavailable('voice', 'Bacaan suara belum bisa diputar. Ikuti teks petunjuk di layar.');
        return false;
      }
    };
    try {
      if (synth.getVoices().length) return read();
      // Some browsers populate voices asynchronously after the first interaction.
      const ready = () => {
        this._clearVoiceWait();
        read();
      };
      if (typeof synth.addEventListener === 'function') {
        this.voiceListener = { synth, handler: ready };
        synth.addEventListener('voiceschanged', ready);
      }
      this.speechTimer = setTimeout(ready, 800);
      return true;
    } catch {
      this._unavailable('voice', 'Bacaan suara belum bisa diputar. Ikuti teks petunjuk di layar.');
      return false;
    }
  }

  stopSpeech() {
    this.speechToken += 1;
    this._clearVoiceWait();
    this.utterance = null;
    try { browser().speechSynthesis?.cancel(); } catch { /* Keep the game usable. */ }
  }

  stop() {
    this.stopSpeech();
    this._stopAudio();
  }

  _clearVoiceWait() {
    if (this.speechTimer !== null) clearTimeout(this.speechTimer);
    this.speechTimer = null;
    if (this.voiceListener) {
      try {
        this.voiceListener.synth.removeEventListener('voiceschanged', this.voiceListener.handler);
      } catch { /* Optional browser API. */ }
      this.voiceListener = null;
    }
  }

  _setMasterVolume() {
    if (!this.master || !this.context) return;
    try {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setValueAtTime(this.options.sound ? this.options.volume : 0, this.context.currentTime);
    } catch { /* A closed context must not affect the simulation. */ }
  }

  _stopAudio() {
    for (const tone of [...this.tones]) {
      try { tone.oscillator.stop(); } catch { /* It may have already ended. */ }
      this._removeTone(tone);
    }
  }

  _removeTone(tone) {
    tone.oscillator.onended = null;
    try { tone.oscillator.disconnect(); } catch { /* It may be disconnected. */ }
    try { tone.envelope.disconnect(); } catch { /* It may be disconnected. */ }
    this.tones.delete(tone);
  }

  _unavailable(kind, message) {
    if (this.notified.has(kind)) return;
    this.notified.add(kind);
    try { this.onUnavailable(kind, message); } catch { /* Feedback never stops play. */ }
  }
}
