/**
 * Web Speech API wrapper for STT (SpeechRecognition) & TTS (SpeechSynthesis)
 * Designed for Korean language (ko-KR) and seamless browser compatibility
 */

// Declare SpeechRecognition interfaces for TypeScript without external packages
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

type SpeechRecognitionType = any;

const SpeechRecognitionClass: SpeechRecognitionType =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export class SpeechRecognitionService {
  private recognition: any = null;
  public isListening = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (err: string) => void;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(SpeechRecognitionClass);
  }

  public start(options: {
    onResult: (text: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (err: string) => void;
  }): boolean {
    if (!SpeechRecognitionService.isSupported()) {
      if (options.onError) {
        options.onError('현재 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 권장합니다.');
      }
      return false;
    }

    try {
      this.stop(); // Stop any existing instance
      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = 'ko-KR';
      this.recognition.interimResults = true;
      this.recognition.continuous = false; // Stop after a complete utterance
      this.recognition.maxAlternatives = 1;

      this.onResultCallback = options.onResult;
      this.onEndCallback = options.onEnd;
      this.onErrorCallback = options.onError;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const recognizedText = finalTranscript || interimTranscript;
        if (recognizedText && this.onResultCallback) {
          this.onResultCallback(recognizedText, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;
        let message = '음성 인식 중 오류가 발생했습니다.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          message = '마이크 사용 권한이 거부되었습니다. 브라우저 주소창 좌측에서 마이크를 허용해 주세요.';
        } else if (event.error === 'no-speech') {
          message = '음성이 감지되지 않았습니다. 다시 마이크를 누르고 말씀해 보세요.';
        } else if (event.error === 'network') {
          message = '네트워크 연결 상태를 확인해 주세요.';
        }
        if (this.onErrorCallback) {
          this.onErrorCallback(message);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      if (options.onError) {
        options.onError('마이크를 시작할 수 없습니다: ' + (err.message || '알 수 없는 오류'));
      }
      return false;
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
  }

  public abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
  }
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  public currentSpeakingId: string | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.cachedVoices = this.synth.getVoices();
  }

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private getKoreanVoice(): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0 && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }
    // Prefer ko-KR voice
    const koVoices = this.cachedVoices.filter((v) => v.lang.includes('ko') || v.lang.includes('KR'));
    if (koVoices.length > 0) {
      // Prioritize natural Google or natural sounding voices if available
      const naturalKo = koVoices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Yuna'));
      return naturalKo || koVoices[0];
    }
    return null;
  }

  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\[.*?\]/g, '') // remove brackets like [히든 미션]
      .replace(/[\*\#\`\~\_\>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public speak(
    text: string,
    id?: string,
    options?: {
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!this.synth) return;

    this.stop();

    const clean = this.cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ko-KR';
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.05;

    const koVoice = this.getKoreanVoice();
    if (koVoice) {
      utterance.voice = koVoice;
    }

    this.currentSpeakingId = id || 'tts_' + Date.now();

    utterance.onend = () => {
      this.currentSpeakingId = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      // Chrome fires error on cancel/stop, which is normal
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[TTS Error]', e);
      }
      this.currentSpeakingId = null;
      if (options?.onError) options.onError();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
      this.currentSpeakingId = null;
    }
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }
}

export const speechRecognition = new SpeechRecognitionService();
export const speechSynthesis = new SpeechSynthesisService();
