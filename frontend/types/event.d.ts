export type Event = {
    _id?: string
    id?: string
    title: string
    description: string
    clubName: string
    bannerURL?: string
    category: "Workshop" | "Seminar" | "Social" | "Competition" | "Other"
    venue: string
    start_time: string
    start_date: string | Date
    end_time: string
    end_date: string | Date
    max_capacity: number
    registeredCount: number
    isClosed?: boolean
    price?: number
    isRegistered?: boolean
    isAdmin?: boolean
}