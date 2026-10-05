import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '38px',
          border: '2px solid #27272a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Crimson Halo Glow */}
        <div
          style={{
            position: 'absolute',
            right: '-10px',
            top: '35px',
            width: '100px',
            height: '100px',
            borderRadius: '50px',
            backgroundColor: '#b3131b',
            opacity: 0.28,
          }}
        />

        {/* High-Contrast Bold "RD" Lettering */}
        <span
          style={{
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '84px',
            fontFamily: 'sans-serif',
            letterSpacing: '-5px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
            marginLeft: '-6px',
          }}
        >
          RD
        </span>

        {/* High-Resolution Suspension Strut & Coil Spring */}
        <svg
          width="50"
          height="110"
          viewBox="0 0 14 36"
          fill="none"
          style={{
            marginLeft: '8px',
            display: 'flex',
          }}
        >
          {/* Top Strut Mount Perch */}
          <rect x="0" y="0.5" width="14" height="2" rx="1" fill="#71717a" />
          {/* Central Damper Strut Rod */}
          <line
            x1="7"
            y1="2"
            x2="7"
            y2="34"
            stroke="#a1a1aa"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Vivid Crimson Coil Spring Loops */}
          <path
            d="M 1 5 L 13 11 L 1 17 L 13 23 L 1 29 L 13 34"
            fill="none"
            stroke="#dc2626"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lower Strut Perch Ring */}
          <rect x="1" y="34.5" width="12" height="1.8" rx="0.9" fill="#71717a" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
