import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient のシングルトン
 * Next.js の開発サーバーはホットリロードでモジュールを再評価するため、
 * globalThis にキャッシュして接続数の増加を防ぐ。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
