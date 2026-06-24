export function parseScheduledTime(timeStr: string, referenceDate = new Date()): Date {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    const fallback = new Date(referenceDate);
    fallback.setHours(23, 59, 0, 0);
    return fallback;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const scheduled = new Date(referenceDate);
  scheduled.setHours(hours, minutes, 0, 0);
  return scheduled;
}

export function isMedicationOverdue(timeStr: string, now = new Date()): boolean {
  return now.getTime() > parseScheduledTime(timeStr, now).getTime();
}

let audioContext: AudioContext | null = null;

function playAlertPattern(pattern: Array<{ frequency: number; delay: number; duration: number }>) {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  const ctx = audioContext;

  for (const tone of pattern) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + tone.delay;

    oscillator.type = "sine";
    oscillator.frequency.value = tone.frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + tone.duration);
  }
}

export function playMedicationAlert(patientName: string, medicationName: string) {
  try {
    playAlertPattern([
      { frequency: 880, delay: 0, duration: 0.15 },
      { frequency: 660, delay: 0.2, duration: 0.15 },
      { frequency: 880, delay: 0.4, duration: 0.2 },
    ]);
  } catch {
    // Audio may be blocked until user interaction
  }

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(
      `Medication missed. ${medicationName} for patient ${patientName}.`,
    );
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export function medicationStorageKey(patientId: string, medicationId: number, date: string) {
  return `icu-med-status:${patientId}:${medicationId}:${date}`;
}

export function playMissingPatientAlert(patientName: string, cameraLabel: string) {
  try {
    playAlertPattern([
      { frequency: 520, delay: 0, duration: 0.18 },
      { frequency: 520, delay: 0.22, duration: 0.18 },
      { frequency: 420, delay: 0.44, duration: 0.3 },
    ]);
  } catch {
    // Audio may be blocked until user interaction
  }

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(
      `Alert. ${patientName} is not detected in ${cameraLabel}.`,
    );
    utterance.rate = 1;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}
