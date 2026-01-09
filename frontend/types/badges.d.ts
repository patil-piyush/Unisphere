export type ApiBadge = {
    name: string
    description: string
    requiredPoints: number | null
    isPermanent: boolean
}

export type ApiBadgesResponse = {
    month: number
    year: number
    points: number
    badges: ApiBadge[]
}

export type BadgeConfigEntry = {
  name: string
  description: string
  requiredPoints: number | null
  isPermanent: boolean
}
