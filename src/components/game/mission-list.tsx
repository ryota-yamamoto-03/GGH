import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface MissionView {
  id: string;
  title: string;
  progress: number;
  targetCount: number;
  completed: boolean;
  rewardLp: number;
}

/**
 * ミッション一覧(クエストログ風)
 */
export function MissionList({ missions }: { missions: MissionView[] }) {
  if (missions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        ミッションはまだありません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {missions.map((m) => (
        <li
          key={m.id}
          className={cn(
            "rounded-xl border p-3 transition-all duration-300",
            m.completed
              ? "border-emerald-300/50 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
              : "hover:border-cyan-300/60 hover:shadow-sm"
          )}
        >
          <div className="flex items-center gap-3">
            {m.completed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 animate-pop-in text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  m.completed && "text-muted-foreground line-through"
                )}
              >
                {m.title}
              </p>
              {m.targetCount > 1 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress
                    value={(m.progress / m.targetCount) * 100}
                    className="h-2"
                    indicatorClassName={m.completed ? "bg-emerald-500" : undefined}
                  />
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {m.progress}/{m.targetCount}
                  </span>
                </div>
              )}
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                m.completed
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary"
              )}
            >
              +{m.rewardLp} LP
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
