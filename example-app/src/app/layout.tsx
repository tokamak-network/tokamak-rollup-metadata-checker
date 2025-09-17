import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ClientThemeToggle from '@/components/ClientThemeToggle';
import '@/utils/ethers-config'; // ethers.js 로그 설정

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tokamak Rollup Metadata Checker',
  description: 'Monitor L2 rollup status from Tokamak rollup metadata repository',
  keywords: ['tokamak', 'rollup', 'l2', 'metadata', 'checker'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-tokamak-blue">
                      Tokamak Rollup Checker
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Real-time L2 Status
                    </span>
                    <ClientThemeToggle />
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  © 2024 Tokamak Network. Built with Next.js & TypeScript.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}