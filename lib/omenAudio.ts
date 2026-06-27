// Module-level singleton so a started Audio element can survive the
// SealedEntry → OmenCard React transition without losing the browser user-gesture context.
//
// We also track whether an error event fired before OmenCard could add its listener,
// fixing the race condition where audio.play() rejects before useEffect runs.

let _pending: HTMLAudioElement | null = null;
let _pendingError = false;

export function setPendingOmenAudio(audio: HTMLAudioElement): void {
  _pending = audio;
  _pendingError = false;
  // Eagerly listen for the error so we can report it even if OmenCard hasn't mounted yet.
  audio.addEventListener('error', () => { _pendingError = true; }, { once: true });
}

// Call this when audio.play() promise rejects (e.g. NotAllowedError).
// The 'error' event on the element only covers media-loading failures, not play() rejections.
export function markPendingOmenAudioFailed(): void {
  _pendingError = true;
}

export function consumePendingOmenAudio(): { audio: HTMLAudioElement; alreadyFailed: boolean } | null {
  if (!_pending) return null;
  const audio = _pending;
  const alreadyFailed = _pendingError || !!audio.error;
  _pending = null;
  _pendingError = false;
  return { audio, alreadyFailed };
}
