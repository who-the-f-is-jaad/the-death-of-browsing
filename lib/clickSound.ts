let _click: HTMLAudioElement | null = null;

export function playClick(): void {
  if (typeof window === 'undefined') return;
  if (!_click) {
    _click = new Audio('/audio/click.wav');
    _click.volume = 0.5;
  }
  _click.currentTime = 0;
  _click.play().catch(() => {});
}
