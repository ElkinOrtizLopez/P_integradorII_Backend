import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita instrumentation.ts para el cron job de recordatorios
  experimental: {
    instrumentationHook: true,
  },
  headers: async () => [
    {
      // Permite que el popup de Google (signInWithPopup) se comunique con la ventana principal
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      ],
    },
  ],
};

export default nextConfig;
