/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    // 빌드 추적에서 성경 데이터 파일 제외 (런타임에만 사용되므로)
    outputFileTracingIgnores: [
      '**/supabase/bible/**',
      '**/supabase/migrations/**',
      '**/android/**',
      '**/ios/**',
      '**/.git/**',
    ],
  },
}

module.exports = nextConfig

