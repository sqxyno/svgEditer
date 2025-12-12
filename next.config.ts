import type { NextConfig } from 'next';
import withRspack from 'next-rspack';

const isProduction = process.env.NODE_ENV === 'production';

// 如果使用自定义域名（如 herrylove.me），basePath 应为空
// 如果使用 GitHub Pages 默认域名（username.github.io/repo-name），需要设置 basePath
const useCustomDomain = true; // 设置为 true 如果使用自定义域名
const repoName = 'next-css-polygon-editor';
const basePath = isProduction && !useCustomDomain ? `/${repoName}` : '';

const nextConfig: NextConfig = {
  /* config options here */
  ...(isProduction
    ? {
        output: 'export',
        images: {
          unoptimized: true,
        },
      }
    : {}),
  basePath: basePath,
  assetPrefix: basePath,
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default withRspack(nextConfig);
