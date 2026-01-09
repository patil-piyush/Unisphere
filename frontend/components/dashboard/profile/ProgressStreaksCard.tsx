// components/dashboard/profile/ProgressStreaksCard.tsx
"use client"

import { Flame, CheckCircle2, Circle } from "lucide-react"
import { BadgeConfigEntry } from "@/types/badges"

type Props = {
  points: number
  eventsCount: number
  monthlyBadgeConfig: BadgeConfigEntry[]
}

const getNextBadgeInfo = (points: number, monthlyBadgeConfig: BadgeConfigEntry[]) => {
  const eligible = monthlyBadgeConfig
    .filter((b) => b.requiredPoints !== null && points >= (b.requiredPoints as number))
    .sort((a, b) => (a.requiredPoints as number) - (b.requiredPoints as number))

  const allNonPermanent = monthlyBadgeConfig.filter((b) => b.requiredPoints !== null)

  const currentBadge = eligible[eligible.length - 1] || null
  const nextBadge =
    allNonPermanent.find(
      (b) => b.requiredPoints !== null && points < (b.requiredPoints as number)
    ) || null

  return { currentBadge, nextBadge }
}

export function ProgressStreaksCard({
  points,
  eventsCount,
  monthlyBadgeConfig,
}: Props) {
  const { currentBadge, nextBadge } = getNextBadgeInfo(points, monthlyBadgeConfig)

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Progress & Streaks</h3>

      {/* Progress to next badge */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress to Next Badge</span>
          <span className="text-xs text-muted-foreground">
            {points} pts this month
          </span>
        </div>

        {!nextBadge ? (
          <p className="text-sm text-muted-foreground">
            You have unlocked all monthly badges for this point range. Keep going to
            maintain your status!
          </p>
        ) : (
          (() => {
            const required = nextBadge.requiredPoints as number
            const percentage = Math.min(100, (points / required) * 100)

            return (
              <>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    Next: <span className="font-medium">{nextBadge.name}</span> (
                    {required} pts)
                  </span>
                  <span className="text-muted-foreground">
                    {points}/{required}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {currentBadge && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: <span className="font-medium">{currentBadge.name}</span>
                  </p>
                )}
              </>
            )
          })()
        )}
      </div>

      {/* Streaks section (placeholder using eventsCount) */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Activity Streak</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {eventsCount > 0
              ? `${Math.min(eventsCount, 7)}-day streak`
              : "No streak yet"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: 7 }).map((_, idx) => {
            const filled = idx < Math.min(eventsCount, 7)
            const DayIcon = filled ? CheckCircle2 : Circle
            return (
              <div
                key={idx}
                className={`flex flex-col items-center gap-1 ${
                  filled ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <DayIcon className="h-4 w-4" />
                <span className="text-[10px] text-muted-foreground">
                  D{idx + 1}
                </span>
              </div>
            )
          })}
        </div>

        {eventsCount === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Attend an event to start your activity streak.
          </p>
        )}
      </div>
    </div>
  )
}
