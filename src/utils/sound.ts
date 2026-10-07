/**
 * Web Audio API synthesizer for retro-modern RPG game sound effects
 * Zero external audio files required, instant playback on any browser
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Sound enabled by default
    const saved = typeof window !== 'undefined' ? localStorage.getItem('dreamquest_sound') : null;
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamquest_sound', String(this.enabled));
    }
    if (this.enabled) {
      this.play('click');
    }
    return this.enabled;
  }

  public play(type: 'click' | 'send' | 'receive' | 'heartUp' | 'heartDown' | 'questSuccess' | 'finish' | 'badge') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (type) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'send': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'receive': {
          // Cheerful two-tone chime
          [523.25, 783.99].forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.08;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.14, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.18);
          });
          break;
        }

        case 'heartUp': {
          // Arpeggio rising
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.06;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.22);
          });
          break;
        }

        case 'heartDown': {
          [440, 392, 349.23].forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
          });
          break;
        }

        case 'questSuccess': {
          // Fanfare with celebratory major chords
          const notes = [
            { f: 523.25, d: 0.1 },
            { f: 659.25, d: 0.1 },
            { f: 783.99, d: 0.12 },
            { f: 1046.5, d: 0.35 },
          ];
          let offset = 0;
          notes.forEach((n) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + offset;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.f, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + n.d);
            offset += 0.09;
          });
          break;
        }

        case 'finish': {
          // Grand fanfare
          const chord1 = [523.25, 659.25, 783.99];
          const chord2 = [587.33, 739.99, 880.0];
          const chord3 = [659.25, 830.61, 987.77];
          const chord4 = [1046.5, 1318.5, 1567.98];

          const playChord = (frequencies: number[], delay: number, duration: number) => {
            frequencies.forEach((freq) => {
              if (!this.ctx) return;
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              const t = now + delay;
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, t);
              gain.gain.setValueAtTime(0.09, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t);
              osc.stop(t + duration);
            });
          };

          playChord(chord1, 0, 0.25);
          playChord(chord2, 0.22, 0.25);
          playChord(chord3, 0.44, 0.28);
          playChord(chord4, 0.72, 0.7);
          break;
        }

        case 'badge': {
          [880, 1174.66, 1760].forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
          });
          break;
        }
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const sound = new SoundController();
