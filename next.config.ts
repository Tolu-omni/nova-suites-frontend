import type { NextConfig } from 'next';

interface RemotePattern {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
}

// Room images are served by the backend, whose origin differs between
// environments. Derive it from NEXT_PUBLIC_API_URL so production (Render) works
// without hardcoding a host. Localhost is kept for local development.
function backendPatterns(): RemotePattern[] {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return [];
  try {
    const { protocol, hostname, port } = new URL(raw);
    if (protocol === 'https:') return [{ protocol: 'https', hostname, port }];
    if (protocol === 'http:') return [{ protocol: 'http', hostname, port }];
  } catch {
    // Malformed URL — fall through to the defaults below.
  }
  return [];
}

const patterns: RemotePattern[] = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'plus.unsplash.com' },
  ...backendPatterns(),
];

const seen = new Set<string>();
const remotePatterns = patterns.filter(pattern => {
  const key = `${pattern.protocol}://${pattern.hostname}:${pattern.port ?? ''}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns,
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
