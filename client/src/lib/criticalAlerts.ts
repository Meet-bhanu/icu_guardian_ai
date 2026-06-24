export const CRITICAL_ALARM_MIN_DURATION_MS = 0;

let audioContext: AudioContext | null = null;
let activeAlarmStop: (() => void) | null = null;
let alarmStartedAt = 0;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

export function isCriticalAlarmActive(): boolean {
  return activeAlarmStop !== null;
}

export function getCriticalAlarmElapsedMs(): number {
  if (!alarmStartedAt) return 0;
  return Date.now() - alarmStartedAt;
}

export function canAcknowledgeCriticalAlarm(): boolean {
  return true; // Acknowledge instantly
}

export function stopCriticalPatientAlarm(): void {
  activeAlarmStop?.();
  activeAlarmStop = null;
  alarmStartedAt = 0;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function playCriticalPatientAlarm(
  patientName: string,
  patientId: string,
  reasons: string[],
): void {
  stopCriticalPatientAlarm();

  const ctx = getAudioContext();
  const startedAt = ctx.currentTime;
  alarmStartedAt = Date.now();

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  const speechTimeouts: ReturnType<typeof setTimeout>[] = [];

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.55; // 40% less loud (60% of 0.92 is ~0.55)
  masterGain.connect(ctx.destination);

  // Play a medical-grade tri-tone chime: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
  // Repeating every 1.8 seconds, up to 15 times (~27 seconds duration)
  const beepDur = 0.12;
  const gap = 0.15;
  const repeatCount = 15;

  for (let i = 0; i < repeatCount; i++) {
    const groupStart = startedAt + i * 1.8;

    // Tone 1: C5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, groupStart);
    gain1.gain.setValueAtTime(0.0001, groupStart);
    gain1.gain.exponentialRampToValueAtTime(0.35, groupStart + 0.02);
    gain1.gain.setValueAtTime(0.35, groupStart + beepDur - 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, groupStart + beepDur);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(groupStart);
    osc1.stop(groupStart + beepDur);
    oscillators.push(osc1);
    gains.push(gain1);

    // Tone 2: E5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, groupStart + gap);
    gain2.gain.setValueAtTime(0.0001, groupStart + gap);
    gain2.gain.exponentialRampToValueAtTime(0.35, groupStart + gap + 0.02);
    gain2.gain.setValueAtTime(0.35, groupStart + gap + beepDur - 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, groupStart + gap + beepDur);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(groupStart + gap);
    osc2.stop(groupStart + gap + beepDur);
    oscillators.push(osc2);
    gains.push(gain2);

    // Tone 3: G5
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(783.99, groupStart + gap * 2);
    gain3.gain.setValueAtTime(0.0001, groupStart + gap * 2);
    gain3.gain.exponentialRampToValueAtTime(0.35, groupStart + gap * 2 + 0.02);
    gain3.gain.setValueAtTime(0.35, groupStart + gap * 2 + beepDur - 0.02);
    gain3.gain.exponentialRampToValueAtTime(0.0001, groupStart + gap * 2 + beepDur);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(groupStart + gap * 2);
    osc3.stop(groupStart + gap * 2 + beepDur);
    oscillators.push(osc3);
    gains.push(gain3);
  }

  const reasonText = reasons.slice(0, 2).join(". ");

  const speak = (text: string, delayMs: number) => {
    const timeout = setTimeout(() => {
      if (!isCriticalAlarmActive()) return;
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 0.6; // 40% less loud (60% of 1.0 is 0.6)
        window.speechSynthesis.speak(utterance);
      }
    }, delayMs);
    speechTimeouts.push(timeout);
  };

  speak(
    `Code blue. Code blue. Patient ${patientName} in ${patientId} is critical. ${reasonText}. All doctors respond immediately.`,
    0,
  );
  speak(
    `Critical emergency. Patient ${patientName}. Condition worsening. Immediate medical response required.`,
    10_000,
  );
  speak(
    `Code blue still active for ${patientName}. Doctors to bedside now.`,
    20_000,
  );

  const autoStopTimeout = setTimeout(() => {
    oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
    });
    masterGain.disconnect();
  }, 30_000);

  activeAlarmStop = () => {
    clearTimeout(autoStopTimeout);
    speechTimeouts.forEach(clearTimeout);
    oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // already stopped
      }
    });
    try {
      masterGain.disconnect();
    } catch {
      // already disconnected
    }
    activeAlarmStop = null;
    alarmStartedAt = 0;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}
