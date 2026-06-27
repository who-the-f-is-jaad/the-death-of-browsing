// Module-level singleton so a started Audio element can survive the
// SealedEntry → OmenCard React transition without losing the user gesture context.
let _pending: HTMLAudioElement | null = null;

export function setPendingOmenAudio(audio: HTMLAudioElement): void {
  _pending = audio;
}

export function consumePendingOmenAudio(): HTMLAudioElement | null {
  const audio = _pending;
  _pending = null;
  return audio;
}
