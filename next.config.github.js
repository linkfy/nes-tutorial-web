/**
 * Configuration for GitHub Pages (project site at https://<user>.github.io/nes-tutorial-web/).
 * Usage (locally or in CI):  cp next.config.github.js next.config.js && yarn build
 * The static site is written to ./out
 */
const BASE_PATH = '/nes-tutorial-web';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  trailingSlash: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  env: { NEXT_BASE_PATH: BASE_PATH },
};

module.exports = nextConfig;
