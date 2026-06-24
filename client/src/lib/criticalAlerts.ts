export const CRITICAL_ALARM_MIN_DURATION_MS = 30_000;

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
  return getCriticalAlarmElapsedMs() >= CRITICAL_ALARM_MIN_DURATION_MS;
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
  masterGain.gain.value = 0.92;
  masterGain.connect(ctx.destination);

  const cycleCount = 60;
  const cycleDuration = 0.5;

  for (let i = 0; i < cycleCount; i++) {
    const t = startedAt + i * cycleDuration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 1320, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.55, t + 0.04);
    gain.gain.setValueAtTime(0.55, t + cycleDuration - 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + cycleDuration);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + cycleDuration);

    oscillators.push(osc);
    gains.push(gain);
  }

  const klaxonOsc = ctx.createOscillator();
  const klaxonGain = ctx.createGain();
  klaxonOsc.type = "sawtooth";
  klaxonOsc.frequency.setValueAtTime(440, startedAt);
  klaxonOsc.frequency.linearRampToValueAtTime(660, startedAt + 15);
  klaxonOsc.frequency.linearRampToValueAtTime(440, startedAt + 30);
  klaxonGain.gain.setValueAtTime(0.0001, startedAt);
  klaxonGain.gain.exponentialRampToValueAtTime(0.35, startedAt + 0.1);
  klaxonGain.gain.setValueAtTime(0.35, startedAt + 29.5);
  klaxonGain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 30);
  klaxonOsc.connect(klaxonGain);
  klaxonGain.connect(masterGain);
  klaxonOsc.start(startedAt);
  klaxonOsc.stop(startedAt + 30);

  const reasonText = reasons.slice(0, 2).join(". ");

  const speak = (text: string, delayMs: number) => {
    const timeout = setTimeout(() => {
      if (!isCriticalAlarmActive()) return;
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
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
    try {
      klaxonOsc.stop();
    } catch {
      // already stopped
    }
    masterGain.disconnect();
  }, CRITICAL_ALARM_MIN_DURATION_MS + 500);

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
      klaxonOsc.stop();
    } catch {
      // already stopped
    }
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
