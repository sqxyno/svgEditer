import { Home, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'SVG编辑器',
  description: '一款强大的SVG编辑工具，帮助您轻松创建和编辑精美的SVG形状',
  keywords: 'SVG, 编辑器, 前端工具',
  authors: [{ name: 'SVG Editor Team' }],
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="flex min-h-screen flex-col">
        {/* 导航栏 */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">SVG编辑器</span>
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Home className="h-4 w-4" />
                <span>首页</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Info className="h-4 w-4" />
                <span>帮助</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        {/* 页脚 */}
        <footer className="border-t border-gray-200 py-6 dark:border-gray-800">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              人生若只如初见，珍惜眼前人，珍惜当下事，祝你幸福(´∀｀)♡ - by herry ©{' '}
              {new Date().getFullYear()}{' '}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
