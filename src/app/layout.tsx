import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GGH ライフポイント",
    template: "%s | GGH ライフポイント",
  },
  description:
    "ゲームを通して生活リズムを整え、社会参加を応援する。ゲーミンググループホームのライフポイント管理アプリ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        {/* ダークモード: class 方式 / OS設定に追従 + 手動切替 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
