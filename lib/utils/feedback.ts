// Haptic feedback and sound effects utility

export class FeedbackManager {
  private static instance: FeedbackManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  // Initialize audio context
  private async initAudio() {
    if (typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Haptic feedback (for mobile devices)
  haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
    if (typeof window === 'undefined' || !navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50]
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      // Vibration not supported, ignore
    }
  }

  // Generate sound effects
  private generateTone(frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play feedback sounds
  async playSound(type: 'click' | 'success' | 'error' | 'notification' | 'premium' | 'match') {
    if (!this.audioContext) {
      await this.initAudio();
    }

    const soundMap = {
      click: () => this.generateTone(800, 0.1),
      success: () => {
        this.generateTone(523, 0.2); // C5
        setTimeout(() => this.generateTone(659, 0.2), 100); // E5
        setTimeout(() => this.generateTone(784, 0.3), 200); // G5
      },
      error: () => {
        this.generateTone(300, 0.2);
        setTimeout(() => this.generateTone(200, 0.3), 150);
      },
      notification: () => this.generateTone(660, 0.15),
      premium: () => {
        // Premium upgrade sound - ascending chord
        this.generateTone(523, 0.15); // C5
        setTimeout(() => this.generateTone(659, 0.15), 50); // E5
        setTimeout(() => this.generateTone(784, 0.15), 100); // G5
        setTimeout(() => this.generateTone(1047, 0.2), 150); // C6
      },
      match: () => {
        // Match found sound - pleasant chime
        this.generateTone(880, 0.2); // A5
        setTimeout(() => this.generateTone(1108, 0.2), 100); // C#6
        setTimeout(() => this.generateTone(1319, 0.3), 200); // E6
      }
    };

    try {
      soundMap[type]?.();
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  // Combined feedback for different actions
  async buttonClick() {
    this.haptic('light');
    await this.playSound('click');
  }

  async success(message?: string) {
    this.haptic('success');
    await this.playSound('success');
  }

  async error(message?: string) {
    this.haptic('error');
    await this.playSound('error');
  }

  async premiumUpgrade() {
    this.haptic('success');
    await this.playSound('premium');
  }

  async matchFound() {
    this.haptic('medium');
    await this.playSound('match');
  }

  async notification() {
    this.haptic('light');
    await this.playSound('notification');
  }
}

// Export singleton instance
export const feedback = FeedbackManager.getInstance(); 