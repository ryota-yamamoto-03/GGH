/**
 * レベル・ランク計算ロジック
 *
 * レベルは「累計獲得LP(totalEarnedLp)」から計算する。
 * 景品交換で所持LPが減ってもレベルは下がらない。
 *
 * レベル n → n+1 に必要なLP: 100 + (n - 1) × 10
 *   Lv1→2: 100LP, Lv2→3: 110LP, ... 緩やかに増加
 */

export type RankKey =
  | "rookie"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "legend";

export interface RankDef {
  level: number;
  name: string;
  key: RankKey;
  /** Tailwind の文字色クラス */
  colorClass: string;
  /** バッジ背景のグラデーション */
  gradientClass: string;
}

/** ランク定義(仕様書のレベル帯) */
export const RANKS: RankDef[] = [
  { level: 1, name: "新人冒険者", key: "rookie", colorClass: "text-slate-500 dark:text-slate-400", gradientClass: "from-slate-400 to-slate-500" },
  { level: 5, name: "ブロンズ", key: "bronze", colorClass: "text-amber-600", gradientClass: "from-amber-500 to-orange-600" },
  { level: 10, name: "シルバー", key: "silver", colorClass: "text-gray-500 dark:text-gray-300", gradientClass: "from-gray-400 to-gray-500" },
  { level: 20, name: "ゴールド", key: "gold", colorClass: "text-yellow-500", gradientClass: "from-yellow-400 to-amber-500" },
  { level: 30, name: "プラチナ", key: "platinum", colorClass: "text-cyan-500", gradientClass: "from-cyan-400 to-sky-500" },
  { level: 50, name: "ダイヤ", key: "diamond", colorClass: "text-indigo-400", gradientClass: "from-indigo-400 to-violet-500" },
  { level: 100, name: "レジェンド", key: "legend", colorClass: "text-pink-500", gradientClass: "from-pink-500 to-rose-500" },
];

const MAX_LEVEL = 100;

/** レベル n から n+1 へ上がるのに必要なLP */
export function lpForNextLevel(level: number): number {
  return 100 + (level - 1) * 10;
}

/** レベル n に到達するのに必要な累計LP */
export function cumulativeLpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += lpForNextLevel(l);
  }
  return total;
}

export interface LevelInfo {
  level: number;
  rank: RankDef;
  /** 次のレベルまでに必要な残りLP(最大レベル時は 0) */
  lpToNext: number;
  /** 現在レベル内での進捗率 0-100 */
  progressPercent: number;
  /** 現在レベル内で獲得済みのLP */
  lpInLevel: number;
  /** 現在レベルの必要LP幅 */
  lpLevelSpan: number;
}

/** 累計獲得LPからレベル情報を算出する */
export function calcLevel(totalEarnedLp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, totalEarnedLp);

  while (level < MAX_LEVEL && remaining >= lpForNextLevel(level)) {
    remaining -= lpForNextLevel(level);
    level++;
  }

  const span = level >= MAX_LEVEL ? 0 : lpForNextLevel(level);
  const isMax = level >= MAX_LEVEL;

  return {
    level,
    rank: rankForLevel(level),
    lpToNext: isMax ? 0 : span - remaining,
    progressPercent: isMax ? 100 : Math.floor((remaining / span) * 100),
    lpInLevel: remaining,
    lpLevelSpan: span,
  };
}

/** レベルに対応するランクを返す */
export function rankForLevel(level: number): RankDef {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (level >= rank.level) current = rank;
  }
  return current;
}

/** 次のランク(最高ランク到達時は null) */
export function nextRank(level: number): RankDef | null {
  return RANKS.find((r) => r.level > level) ?? null;
}
