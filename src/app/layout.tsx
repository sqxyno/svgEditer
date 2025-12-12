import type { Metadata } from 'next';
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
    <html lang="zh-CN">
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
