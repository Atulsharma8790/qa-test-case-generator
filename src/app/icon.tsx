import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        ✓
      </div>
    ),
    { ...size }
  )
}
