import type { NextConfig } from 'next';
import withRspack from 'next-rspack';

const isProduction = process.env.NODE_ENV === 'production';

// GitHub Pages 部署路径（仓库名）
const repoName = 'svgEditer';
const basePath = isProduction ? `/${repoName}` : '';

const nextConfig: NextConfig = {
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
