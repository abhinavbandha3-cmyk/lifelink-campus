/** Brand motifs: a soft ECG heartbeat line and a blood drop. */

export function HeartbeatLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 60"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 H120 l10 -14 l12 28 l12 -44 l12 44 l10 -14 h50 l10 -10 l10 20 l10 -10 h80 l10 -14 l12 28 l12 -44 l12 44 l10 -14 H600"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="heartbeat-line"
      />
    </svg>
  );
}

export function DropMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M16 2C16 2 5.5 13.2 5.5 20.2C5.5 26.2 10.2 30.5 16 30.5C21.8 30.5 26.5 26.2 26.5 20.2C26.5 13.2 16 2 16 2Z"
        fill="currentColor"
      />
      <path
        d="M11.5 20.6H13.4L14.8 17.2L16.9 23.6L18.5 20.6H20.8"
        stroke="white"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
