import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const alt = 'THE DEATH OF BROWSING';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const [sheepBuffer, cinzelBuffer, fellItalicBuffer] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/assets/sheep-head-removebg-preview.png')),
    readFile(path.join(process.cwd(), 'public/fonts/Cinzel/static/Cinzel-Regular.ttf')),
    readFile(path.join(process.cwd(), 'public/fonts/IM_Fell_English/IMFellEnglish-Italic.ttf')),
  ]);

  const sheepSrc = `data:image/png;base64,${sheepBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          padding: '80px',
        }}
      >
        {/* Sheep head */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheepSrc}
          width={130}
          height={130}
          style={{ objectFit: 'contain', opacity: 0.9 }}
          alt=""
        />

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              fontFamily: 'Cinzel',
              fontSize: 60,
              fontWeight: 400,
              color: '#ffffff',
              letterSpacing: '0.1em',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            THE DEATH OF BROWSING
          </div>
          <div
            style={{
              fontFamily: 'FellEnglish',
              fontSize: 26,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            One record. One riddle. Every dawn.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Cinzel', data: cinzelBuffer, style: 'normal', weight: 400 },
        { name: 'FellEnglish', data: fellItalicBuffer, style: 'italic', weight: 400 },
      ],
    }
  );
}
