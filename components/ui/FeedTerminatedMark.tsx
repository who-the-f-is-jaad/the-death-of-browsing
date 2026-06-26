// The ownable icon/motif of THE DEATH OF BROWSING.
// A vinyl record (the one record that survived) with a broken scrollbar
// (the terminated feed) running through its center axis.

interface Props {
  size?: number;
  className?: string;
}

export default function FeedTerminatedMark({ size = 80, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* ── Record grooves ─────────────────────────────────────────── */}
      <circle cx="40" cy="40" r="37"  fill="#0e0906" stroke="rgba(58,44,26,0.75)" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="30"  fill="none"    stroke="rgba(58,44,26,0.45)" strokeWidth="0.75"/>
      <circle cx="40" cy="40" r="23"  fill="none"    stroke="rgba(58,44,26,0.32)" strokeWidth="0.75"/>
      <circle cx="40" cy="40" r="16"  fill="none"    stroke="rgba(58,44,26,0.22)" strokeWidth="0.75"/>
      <circle cx="40" cy="40" r="9"   fill="none"    stroke="rgba(58,44,26,0.14)" strokeWidth="0.75"/>
      {/* Center spindle hole */}
      <circle cx="40" cy="40" r="2.5" fill="#060504"/>

      {/* ── Broken scrollbar (the terminated feed) ─────────────────── */}
      {/* Top section: intact scroll, solid gold */}
      <rect x="38.5" y="4"  width="3" height="28" fill="#E69A28" opacity="0.9"/>

      {/* Fracture point: two diagonal crack lines */}
      <line x1="33" y1="33" x2="40" y2="37" stroke="#E69A28" strokeWidth="1.2" opacity="0.8"/>
      <line x1="40" y1="33" x2="47" y2="37" stroke="#991414" strokeWidth="1"   opacity="0.7"/>

      {/* Bottom section: dying scroll, fragmenting */}
      <rect x="38.5" y="38" width="3" height="10" fill="#E69A28" opacity="0.45"/>
      <rect x="38.5" y="51" width="3" height="6"  fill="#E69A28" opacity="0.22"/>
      <rect x="38.5" y="60" width="3" height="4"  fill="#E69A28" opacity="0.09"/>
      {/* The feed terminates here — nothing below */}
    </svg>
  );
}
