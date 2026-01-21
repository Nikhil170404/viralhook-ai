import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'ViralHook AI - Create Viral Video Concepts';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Background Gradients for depth */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '600px',
                        height: '600px',
                        background: '#A855F7',
                        filter: 'blur(150px)',
                        opacity: 0.2,
                        borderRadius: '50%',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        background: '#EC4899',
                        filter: 'blur(150px)',
                        opacity: 0.2,
                        borderRadius: '50%',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* SVG Logo - Large Scale */}
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="viralGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#A855F7" />
                                <stop offset="100%" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M17.5 2L4 18H14.5L12 30L28 12H16L17.5 2Z"
                            fill="url(#viralGradient)"
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="0.5"
                        />
                        <path
                            d="M16 12L24 12L14 24L16 12Z"
                            fill="white"
                            fillOpacity="0.2"
                        />
                    </svg>

                    {/* Text Logo */}
                    <div style={{ display: 'flex', fontSize: 80, fontWeight: 900, letterSpacing: '-0.05em' }}>
                        <span style={{ color: 'white' }}>VIRAL</span>
                        <span
                            style={{
                                background: 'linear-gradient(to right, #A855F7, #EC4899)',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            HOOK
                        </span>
                        <span style={{ color: '#EC4899', fontSize: 40, marginTop: 10, opacity: 0.8 }}>.AI</span>
                    </div>
                </div>

                <div style={{ color: '#9CA3AF', fontSize: 32, marginTop: 24, fontWeight: 500 }}>
                    Create Viral Video Concepts Instantly
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
