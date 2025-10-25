/** @type {import('next').NextConfig} */

// Android 빌드 시에만 static export 사용
const isAndroidBuild = process.env.ANDROID_BUILD === 'true';

const nextConfig = {
  reactStrictMode: true,
  // Android 빌드 시에만 static export
  ...(isAndroidBuild && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

