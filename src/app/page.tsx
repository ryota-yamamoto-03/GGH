import Link from "next/link";
import { Gamepad2, Sparkles, Trophy, Target, Gift, ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ランディングページ(未ログインでも閲覧可能)
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* 背景の装飾グロー */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10" />

      <div className="container relative flex min-h-dvh flex-col items-center justify-center py-16 text-center">
        <div className="animate-float mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-game-gradient shadow-xl shadow-sky-300/50 dark:shadow-sky-900/50">
          <Gamepad2 className="h-10 w-10 text-white" />
        </div>

        <h1 className="animate-slide-up text-4xl font-extrabold tracking-tight sm:text-6xl">
          <span className="text-game-gradient">GGH ライフポイント</span>
        </h1>
        <p className="mt-4 max-w-xl animate-slide-up text-lg text-muted-foreground [animation-delay:100ms]">
          ゲームを通して生活リズムを整え、社会参加を応援する。
          <br />
          毎日の一歩が、あなたの経験値になる。
        </p>

        <div className="mt-8 animate-slide-up [animation-delay:200ms]">
          <Button asChild variant="game" size="lg" className="animate-glow-pulse">
            <Link href="/login">
              <Sparkles className="h-5 w-5" />
              冒険をはじめる
            </Link>
          </Button>
        </div>

        {/* 特徴カード */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, title: "クエスト", desc: "毎日のミッションで生活リズムづくり" },
            { icon: Trophy, title: "実績", desc: "がんばりが実績として残る" },
            { icon: Gift, title: "ポイント交換", desc: "貯めたLPで好きな景品と交換" },
            { icon: ChartLine, title: "成長の見える化", desc: "レベルとグラフで自己成長を実感" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass-panel animate-slide-up p-5 text-left"
              style={{ animationDelay: `${300 + i * 100}ms` }}
            >
              <f.icon className="mb-3 h-7 w-7 text-primary" />
              <h3 className="font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          ※ ポイント制度は競争ではなく、自己成長を可視化するための仕組みです
        </p>
      </div>
    </main>
  );
}
