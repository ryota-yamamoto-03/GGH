"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import type { LevelInfo } from "@/lib/level";
import { formatLp } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * ホーム画面のメインステータスカード(ゲームのステータス画面風)
 * プロフィール / レベル / ランク / LP / 経験値バーを表示
 */
export function LevelCard({
  name,
  avatarUrl,
  currentLp,
  totalEarnedLp,
  levelInfo,
}: {
  name: string;
  avatarUrl: string | null;
  currentLp: number;
  totalEarnedLp: number;
  levelInfo: LevelInfo;
}) {
  const { level, rank, lpToNext, progressPercent } = levelInfo;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel neon-border relative overflow-hidden p-6"
      aria-label="ステータス"
    >
      {/* 背景のきらめき */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl dark:bg-cyan-500/10" />
      <Sparkles className="absolute right-5 top-5 h-5 w-5 animate-sparkle text-cyan-400" />

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        {/* アバター + レベルバッジ */}
        <div className="relative shrink-0">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,#22d3ee,#3b82f6,#22d3ee)] opacity-70 blur-[2px]"
          />
          <Avatar className="relative h-24 w-24 border-4 border-background">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="text-3xl">{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r ${rank.gradientClass} px-3 py-0.5 text-xs font-bold text-white shadow-md`}
          >
            Lv{level}
          </div>
        </div>

        {/* 名前・ランク・LP */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="truncate text-2xl font-extrabold">{name}</h1>
            <Badge className={`bg-gradient-to-r ${rank.gradientClass} border-0 text-white`}>
              {rank.name}
            </Badge>
          </div>

          <div className="mt-3 flex items-end justify-center gap-6 sm:justify-start">
            <div>
              <p className="text-xs text-muted-foreground">所持ポイント</p>
              <motion.p
                key={currentLp}
                initial={{ scale: 1.2, color: "#22d3ee" }}
                animate={{ scale: 1 }}
                className="text-3xl font-extrabold tabular-nums text-game-gradient"
              >
                {currentLp.toLocaleString()}
                <span className="ml-1 text-base font-bold">LP</span>
              </motion.p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">累計獲得</p>
              <p className="text-lg font-bold tabular-nums">{formatLp(totalEarnedLp)}</p>
            </div>
          </div>

          {/* 経験値バー */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-cyan-500" />
                EXP
              </span>
              <span className="font-semibold text-muted-foreground">
                {lpToNext > 0
                  ? `次のレベルまで あと ${formatLp(lpToNext)}`
                  : "最大レベル到達!"}
              </span>
            </div>
            <div className="relative h-3.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="relative h-full rounded-full bg-game-gradient"
              >
                {/* バー上のシャイン */}
                <div className="absolute inset-0 animate-shine bg-shine-gradient bg-[length:200%_100%]" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
