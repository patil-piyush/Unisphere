export type EventCard = {
    id: string
    title: string
    startDateISO: string
    endDateISO?: string
    dateLabel: string
    timeLabel: string
    location: string
    image: string
    attended?: boolean
    certificateAvailable?: boolean
    pointsEarned?: number
}