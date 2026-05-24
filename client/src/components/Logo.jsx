/**
 * LogoIcon — the geometric icon mark from logo.svg, cropped from the full 880x880 SVG.
 * The icon mark occupies roughly (314, 266) → (560, 505) in the original coordinate space.
 */
export function LogoIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="314 266 247 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M315.039 504.919L315.069 354.719L430.859 354.399L473.879 302.079L353.009 301.849L352.979 341.689L315.099 341.959L315.299 266.959L534.039 266.859C524.279 281.409 513.499 293.879 502.659 307.429L473.709 343.629L439.529 385.809L352.569 385.889L352.979 489.019L315.049 504.929L315.039 504.919Z"
        fill="white"
      />
      <path
        d="M400.679 439.111L385.619 456.401L385.359 406.131L426.019 406.541L400.679 439.111Z"
        fill="white"
      />
      <path
        d="M557 266L394 471.501L480.5 438.501L559.581 340.001V268.5L557 266Z"
        fill="url(#logo_icon_g1)"
      />
      <path
        d="M557 266L394.5 471L401 469L559.5 268.5L557 266Z"
        fill="url(#logo_icon_g2)"
      />
      <defs>
        <linearGradient id="logo_icon_g1" x1="560" y1="266" x2="434.5" y2="452.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A71FD" />
          <stop offset="1" stopColor="#132389" />
        </linearGradient>
        <linearGradient id="logo_icon_g2" x1="552" y1="264" x2="405" y2="469" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B5D8FE" />
          <stop offset="1" stopColor="#132EBE" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * LogoFull — the complete logo.svg rendered as an <img>.
 * Best used at larger sizes where the PANVERRA text is readable.
 */
export function LogoFull({ height = 40, className = '' }) {
  return (
    <img
      src="/logo.svg"
      alt="PANVERRA"
      height={height}
      style={{ height }}
      className={className}
      draggable={false}
    />
  )
}
