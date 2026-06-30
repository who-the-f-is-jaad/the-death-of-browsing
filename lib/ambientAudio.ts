// Module-level singleton so all components share one audio instance
const SRC = '/audio/Quest%20Master%20-%20In%20the%20Abbey%20of%20Innocence.mp3';

let audio: HTMLAudioElement | null = null;
let pausedByOmen = false;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = 0.28;
  }
  return audio;
}

// Pause ambient while the record clip plays; resume when it stops
if (typeof window !== 'undefined') {
  document.addEventListener('omen-audio-start', () => {
    if (isAmbientPlaying()) {
      getAudio().pause();
      pausedByOmen = true;
    }
  });
  document.addEventListener('omen-audio-stop', () => {
    if (pausedByOmen) {
      pausedByOmen = false;
      getAudio().play().catch(() => {});
    }
  });
}

// Pre-create the audio element and return it — call early to make
// volumechange events fire on iOS when physical volume buttons are pressed.
export function getAmbientElement(): HTMLAudioElement {
  return getAudio();
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
