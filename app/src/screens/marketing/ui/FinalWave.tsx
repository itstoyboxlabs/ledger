export function FinalWave() {
  return (
    <svg className="wave" viewBox="0 0 1200 170" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b98ff" stopOpacity=".35" />
          <stop offset="1" stopColor="#8b98ff" stopOpacity="0" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path d="M0 60 C 300 140, 900 140, 1200 60 L1200 170 L0 170Z" fill="url(#wg)" />
      <path d="M0 60 C 300 140, 900 140, 1200 60" fill="none" stroke="#a3adff" strokeWidth="3" filter="url(#blur)" />
      <path d="M0 60 C 300 140, 900 140, 1200 60" fill="none" stroke="#dfe3ff" strokeWidth="1.2" />
    </svg>
  )
}
