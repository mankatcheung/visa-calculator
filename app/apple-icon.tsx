import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Hex equivalents of the --primary/--primary-foreground tokens:
        // Satori (used to rasterize this) doesn't support oklch().
        background: '#171717',
      }}
    >
      <svg width={96} height={96} viewBox="120 140 272 272" fill="none">
        <rect x={160} y={140} width={32} height={72} rx={16} fill="#fafafa" />
        <rect x={320} y={140} width={32} height={72} rx={16} fill="#fafafa" />
        <rect x={120} y={180} width={272} height={232} rx={28} fill="#fafafa" />
        <rect x={120} y={236} width={272} height={12} fill="#171717" />
        <path
          d="M188 330 L232 374 L338 268"
          stroke="#171717"
          strokeWidth={30}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    { ...size }
  );
}
