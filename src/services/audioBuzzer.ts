/**
 * Web Audio API synthesizer for FloraSense ESP32 Passive Buzzer (GPIO 19)
 * and mini water pump acoustic feedback.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playBuzzerBeep(freq = 2400, durationMs = 120, type: OscillatorType = 'square') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (durationMs / 1000) + 0.05);
  } catch (e) {
    console.debug('Audio play failed:', e);
  }
}

export function playPumpStartChime() {
  playBuzzerBeep(1800, 90, 'triangle');
  setTimeout(() => {
    playBuzzerBeep(2400, 140, 'triangle');
  }, 100);
}

export function playAlertAlarm() {
  playBuzzerBeep(3200, 100, 'square');
  setTimeout(() => playBuzzerBeep(3200, 100, 'square'), 160);
  setTimeout(() => playBuzzerBeep(3200, 160, 'square'), 320);
}
