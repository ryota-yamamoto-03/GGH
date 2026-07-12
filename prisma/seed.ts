/**
 * 初期データ投入スクリプト
 * 実行: npm run db:seed
 *
 * - ポイント行動マスタ(仕様書の初期設定20種)
 * - 実績マスタ(Steam実績風)
 * - デイリー / ウィークリーミッションテンプレート
 * - 交換商品(ゲームショップ)
 * - アプリ設定(ランキングON)
 */
import { PrismaClient, MissionType } from "@prisma/client";

const prisma = new PrismaClient();

// ---------- ポイント行動マスタ(初期設定) ----------
const pointActions = [
  { name: "起床", points: 5, icon: "sunrise", category: "生活" },
  { name: "朝食", points: 5, icon: "coffee", category: "生活" },
  { name: "服薬", points: 10, icon: "pill", category: "健康" },
  { name: "歯磨き", points: 5, icon: "sparkles", category: "生活" },
  { name: "洗濯", points: 10, icon: "shirt", category: "生活" },
  { name: "掃除", points: 10, icon: "brush", category: "生活" },
  { name: "ゴミ出し", points: 10, icon: "trash-2", category: "生活" },
  { name: "買い物", points: 20, icon: "shopping-cart", category: "外出" },
  { name: "外出", points: 20, icon: "footprints", category: "外出" },
  { name: "病院受診", points: 20, icon: "stethoscope", category: "健康" },
  { name: "B型作業所", points: 40, icon: "briefcase", category: "活動" },
  { name: "デイケア参加", points: 30, icon: "users", category: "活動" },
  { name: "ゲーム大会参加", points: 15, icon: "gamepad-2", category: "イベント" },
  { name: "交流イベント", points: 20, icon: "party-popper", category: "イベント" },
  { name: "自主勉強", points: 15, icon: "book-open", category: "学習" },
  { name: "動画編集", points: 20, icon: "clapperboard", category: "学習" },
  { name: "AI学習", points: 20, icon: "bot", category: "学習" },
  { name: "筋トレ", points: 20, icon: "dumbbell", category: "運動" },
  { name: "ウォーキング", points: 15, icon: "footprints", category: "運動" },
  { name: "就寝時間達成", points: 10, icon: "moon", category: "生活" },
];

// ---------- 実績マスタ(Steam実績風) ----------
const achievements = [
  { code: "FIRST_LOGIN", name: "冒険のはじまり", description: "初めてログインした", icon: "door-open", bonusLp: 10 },
  { code: "FIRST_OUTING", name: "はじめの一歩", description: "初めて外出した", icon: "footprints", bonusLp: 10 },
  { code: "MEDICINE_30_STREAK", name: "健康マスター", description: "30日連続で服薬した", icon: "shield-check", bonusLp: 50 },
  { code: "TOTAL_100_LP", name: "駆け出し冒険者", description: "累計100PTを達成した", icon: "coins", bonusLp: 10 },
  { code: "TOTAL_1000_LP", name: "千の道も一歩から", description: "累計1000PTを達成した", icon: "gem", bonusLp: 50 },
  { code: "WAKEUP_100_STREAK", name: "太陽の戦士", description: "100日連続で起床チェックを達成した", icon: "sun", bonusLp: 100 },
  { code: "GAME_CHAMPION", name: "チャンピオン", description: "ゲーム大会で優勝した", icon: "trophy", bonusLp: 100 },
  { code: "FIRST_WORK", name: "社会への扉", description: "初めて就労した", icon: "briefcase", bonusLp: 100 },
  { code: "FIRST_COOKING", name: "見習いシェフ", description: "初めて料理をした", icon: "chef-hat", bonusLp: 20 },
  { code: "FIRST_EXCHANGE", name: "はじめてのお買い物", description: "初めてポイントを交換した", icon: "gift", bonusLp: 10 },
  { code: "LEVEL_10", name: "シルバーランク到達", description: "レベル10に到達した", icon: "medal", bonusLp: 30 },
  { code: "SECRET_NIGHT_OWL", name: "???", description: "隠し実績:イベントで大活躍する", icon: "star", bonusLp: 50, isSecret: true },
];

// ---------- ミッションテンプレート ----------
const missionTemplates: {
  title: string;
  description?: string;
  type: MissionType;
  targetCount: number;
  rewardLp: number;
  actionName?: string; // 紐付けるポイント行動名
}[] = [
  // デイリー(毎日自動生成)
  { title: "朝食を食べる", type: "DAILY", targetCount: 1, rewardLp: 5, actionName: "朝食" },
  { title: "外出する", type: "DAILY", targetCount: 1, rewardLp: 10, actionName: "外出" },
  { title: "掃除する", type: "DAILY", targetCount: 1, rewardLp: 5, actionName: "掃除" },
  { title: "服薬する", type: "DAILY", targetCount: 1, rewardLp: 5, actionName: "服薬" },
  // ウィークリー(毎週月曜に生成)
  { title: "今週5日外出しよう", type: "WEEKLY", targetCount: 5, rewardLp: 50, actionName: "外出" },
  { title: "B型作業所に5回参加しよう", type: "WEEKLY", targetCount: 5, rewardLp: 80, actionName: "B型作業所" },
  { title: "運動を3回しよう", type: "WEEKLY", targetCount: 3, rewardLp: 40, actionName: "筋トレ" },
];

// ---------- 交換商品(ゲームショップ) ----------
const rewardItems = [
  { name: "お菓子セット", description: "好きなお菓子と交換できます", costLp: 500, icon: "candy" },
  { name: "Nintendoプリペイド 500円", description: "ニンテンドーeショップで使えるプリペイド", costLp: 1000, icon: "gamepad-2" },
  { name: "Steamギフトカード 500円", description: "Steamで使えるギフトカード", costLp: 1000, icon: "cloud-download" },
  { name: "PlayStationギフト 500円", description: "PS Storeで使えるギフトコード", costLp: 1000, icon: "gamepad" },
  { name: "好きなゲームソフト", description: "スタッフと相談して好きなソフトを1本", costLp: 3000, icon: "disc-3" },
  { name: "ゲーミングマウス", description: "高性能ゲーミングマウス", costLp: 5000, icon: "mouse" },
  { name: "ゲーミングキーボード", description: "光るメカニカルキーボード", costLp: 8000, icon: "keyboard" },
  { name: "ゲーミングチェア", description: "長時間でも快適なゲーミングチェア", costLp: 10000, icon: "armchair" },
];

async function main() {
  console.log("🌱 シード投入を開始します...");

  // ポイント行動マスタ
  for (const [i, action] of pointActions.entries()) {
    const existing = await prisma.pointAction.findFirst({ where: { name: action.name } });
    if (!existing) {
      await prisma.pointAction.create({ data: { ...action, sortOrder: i } });
    }
  }
  console.log(`✅ ポイント行動: ${pointActions.length}件`);

  // 実績マスタ
  for (const [i, a] of achievements.entries()) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {},
      create: { ...a, sortOrder: i },
    });
  }
  console.log(`✅ 実績: ${achievements.length}件`);

  // ミッションテンプレート
  for (const [i, m] of missionTemplates.entries()) {
    const existing = await prisma.missionTemplate.findFirst({ where: { title: m.title } });
    if (!existing) {
      const action = m.actionName
        ? await prisma.pointAction.findFirst({ where: { name: m.actionName } })
        : null;
      await prisma.missionTemplate.create({
        data: {
          title: m.title,
          description: m.description,
          type: m.type,
          targetCount: m.targetCount,
          rewardLp: m.rewardLp,
          actionId: action?.id,
          sortOrder: i,
        },
      });
    }
  }
  console.log(`✅ ミッションテンプレート: ${missionTemplates.length}件`);

  // 交換商品
  for (const [i, item] of rewardItems.entries()) {
    const existing = await prisma.rewardItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.rewardItem.create({ data: { ...item, sortOrder: i } });
    }
  }
  console.log(`✅ 交換商品: ${rewardItems.length}件`);

  // アプリ設定
  await prisma.appSetting.upsert({
    where: { key: "ranking_enabled" },
    update: {},
    create: { key: "ranking_enabled", value: "true" },
  });
  console.log("✅ アプリ設定");

  console.log("🎉 シード投入が完了しました");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
