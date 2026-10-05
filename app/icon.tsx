import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          borderRadius: '7px',
          border: '1px solid #27272a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle ambient crimson suspension glow */}
        <div
          style={{
            position: 'absolute',
            right: '-2px',
            top: '6px',
            width: '18px',
            height: '18px',
            borderRadius: '9px',
            backgroundColor: '#b3131b',
            opacity: 0.25,
          }}
        />

        {/* High-Contrast Bold "RD" Lettering */}
        <span
          style={{
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '15px',
            fontFamily: 'sans-serif',
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
            marginLeft: '-1px',
          }}
        >
          RD
        </span>

        {/* Integrated Crimson Red Suspension Coil Spring */}
        <svg
          width="9"
          height="19"
          viewBox="0 0 14 36"
          fill="none"
          style={{
            marginLeft: '1.5px',
            display: 'flex',
          }}
        >
          {/* Central Damper Strut Rod */}
          <line
            x1="7"
            y1="2"
            x2="7"
            y2="34"
            stroke="#71717a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Vivid Crimson Coil Spring Loops */}
          <path
            d="M 1 5 L 13 11 L 1 17 L 13 23 L 1 29 L 13 34"
            fill="none"
            stroke="#dc2626"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
