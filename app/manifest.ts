import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'UK Visa Leave Tracker',
    short_name: 'Visa Tracker',
    description: 'Track leave days and visa milestones for UK visa compliance.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: 'oklch(1 0 0)',
    theme_color: 'oklch(1 0 0)',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
