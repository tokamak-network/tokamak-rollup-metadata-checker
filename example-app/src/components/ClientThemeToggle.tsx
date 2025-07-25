'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => (
    <div className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="w-5 h-5" />
    </div>
  )
});

export default function ClientThemeToggle() {
  return <ThemeToggle />;
}
