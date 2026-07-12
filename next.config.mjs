/** @type {import('next').NextConfig} */
const nextConfig = {
  // Google アカウントのプロフィール画像を表示するための許可リスト
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  eslint: {
    // CI では別途 lint を実行する想定のため、build 時には無視する
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
