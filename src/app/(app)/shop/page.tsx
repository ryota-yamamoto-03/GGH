import { Coins, Store } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DynamicIcon } from "@/components/icon";
import { ExchangeButton } from "@/components/game/exchange-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "ポイント交換所" };

/**
 * ポイント交換所(ゲームショップ風)
 */
export default async function ShopPage() {
  const user = await requireUser();

  const items = await prisma.rewardItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { costLp: "asc" }],
  });

  return (
    <div className="container space-y-6 py-6">
      <header className="glass-panel animate-slide-up flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Store className="h-6 w-6 text-primary" />
            ポイント交換所
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            貯めたライフポイントを好きな景品と交換しよう
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-game-gradient px-4 py-2 text-white shadow-lg shadow-sky-300/40 dark:shadow-sky-900/40">
          <Coins className="h-5 w-5" />
          <span className="text-lg font-extrabold tabular-nums">
            {user.currentLp.toLocaleString()} LP
          </span>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, i) => {
          const affordable = user.currentLp >= item.costLp;
          const inStock = item.stock === null || item.stock > 0;

          return (
            <li
              key={item.id}
              className="glass-panel animate-slide-up group flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-800 dark:to-slate-700">
                <DynamicIcon
                  name={item.icon}
                  className="h-12 w-12 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                />
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-tight">{item.name}</h3>
                {item.stock !== null && (
                  <Badge variant={item.stock > 0 ? "secondary" : "destructive"} className="shrink-0">
                    残り{item.stock}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="mt-1 flex-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
              <p className="my-3 text-xl font-extrabold tabular-nums text-game-gradient">
                {item.costLp.toLocaleString()} LP
              </p>
              <ExchangeButton
                itemId={item.id}
                itemName={item.name}
                costLp={item.costLp}
                affordable={affordable}
                inStock={inStock}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
