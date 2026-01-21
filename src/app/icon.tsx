import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20%', // Rounded square for app icon feel
                }}
            >
                {/* SVG Logo - Scaled to fit 32x32 */}
                <svg
                    width="24"
                    height="24"
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
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    );
}
