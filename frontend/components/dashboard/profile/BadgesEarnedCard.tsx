// components/dashboard/profile/BadgesEarnedCard.tsx
"use client"

import { Award, ChevronUp, Compass, Crown, Handshake, Medal, Star, Trophy, Users, BookOpen } from "lucide-react"
import { ApiBadge } from "@/types/badges"

type Props = {
  earnedBadges: ApiBadge[]
}

const getBadgeUI = (badge: ApiBadge) => {
  switch (badge.name) {
    case "Newcomer":
      return {
        icon: <Star className="h-5 w-5" />,
        color: "bg-blue-500/10 text-blue-500",
      }
    case "Explorer":
      return {
        icon: <Compass className="h-5 w-5" />,
        color: "bg-emerald-500/10 text-emerald-500",
      }
    case "Learner":
      return {
        icon: <BookOpen className="h-5 w-5" />,
        color: "bg-indigo-500/10 text-indigo-500",
      }
    case "Contributor":
      return {
        icon: <Handshake className="h-5 w-5" />,
        color: "bg-teal-500/10 text-teal-500",
      }
    case "Achiever":
      return {
        icon: <Medal className="h-5 w-5" />,
        color: "bg-yellow-500/10 text-yellow-500",
      }
    case "Leader":
      return {
        icon: <Crown className="h-5 w-5" />,
        color: "bg-orange-500/10 text-orange-500",
      }
    case "Star Student":
      return {
        icon: <Users className="h-5 w-5" />,
        color: "bg-purple-500/10 text-purple-500",
      }
    case "Campus Icon":
      return {
        icon: <Award className="h-5 w-5" />,
        color: "bg-pink-500/10 text-pink-500",
      }
    case "UniSphere Elite":
      return {
        icon: <Trophy className="h-5 w-5" />,
        color: "bg-amber-500/10 text-amber-500",
      }
    case "UniSphere Champion":
      return {
        icon: <ChevronUp className="h-5 w-5" />,
        color: "bg-red-500/10 text-red-500",
      }
    case "Student of the Year":
      return {
        icon: <Medal className="h-5 w-5" />,
        color: "bg-lime-500/10 text-lime-500",
      }
    default:
      return {
        icon: <Star className="h-5 w-5" />,
        color: "bg-muted text-foreground",
      }
  }
}

export function BadgesEarnedCard({ earnedBadges }: Props) {
  return (
    <div className="glass rounded-2xl p-6 mt-6">
      <h3 className="font-semibold mb-4">Badges Earned</h3>

      {earnedBadges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No badges earned yet. Participate in events to unlock badges.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {earnedBadges.map((badge) => {
            const ui = getBadgeUI(badge)
            return (
              <div
                key={badge.name}
                className={`rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 ${ui.color}`}
              >
                {ui.icon}
                <p className="text-xs font-medium mt-1">{badge.name}</p>
                <p className="text-[10px] opacity-80">{badge.description}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
