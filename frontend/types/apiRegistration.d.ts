export type ApiRegistration = {
    _id: string
    attended?: boolean
    certificateAvailable?: boolean
    pointsEarned?: number
    event_id: {
        _id: string
        title: string
        start_date: string // ISO
        end_date?: string   // ISO
        start_time?: string
        end_time?: string
        venue?: string
        bannerURL?: string
    }
}
