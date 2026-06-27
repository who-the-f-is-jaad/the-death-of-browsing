// Module-level singleton so all components share one audio instance
const SRC = '/audio/Quest Master - In the Abbey of Innocence.mp3';

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = 0.28;
  }
  return audio;
}

export function playAmbient(): Promise<void> {
  return getAudio().play();
}

export function pauseAmbient(): void {
  getAudio().pause();
}

export function toggleAmbient(): Promise<void> | void {
  const a = getAudio();
  if (a.paused) return a.play();
  a.pause();
}

export function isAmbientPlaying(): boolean {
  return !!(audio && !audio.paused);
}
