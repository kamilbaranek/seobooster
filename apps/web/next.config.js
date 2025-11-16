const { config: loadEnv } = require('dotenv');
const { existsSync } = require('fs');
const { resolve } = require('path');

// Load root .env / .env.local so NEXT_PUBLIC_* vars are available in the web app
const projectRoot = resolve(__dirname, '../..');
['.env', '.env.local'].forEach((file, index) => {
  const fullPath = resolve(projectRoot, file);
  if (existsSync(fullPath)) {
    loadEnv({ path: fullPath, override: index > 0 });
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

module.exports = nextConfig;
