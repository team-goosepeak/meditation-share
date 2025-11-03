/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    // 빌드 추적에서 성경 데이터 파일 제외
    // .vercelignore와 함께 사용하여 이중으로 보호
    outputFileTracingIgnores: [
      '**/supabase/bible/**',
      '**/supabase/migrations/**',
      '**/android/**',
      '**/ios/**',
    ],
  },
}

module.exports = nextConfig

