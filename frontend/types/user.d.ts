export type User = {
    name: string
    email: string
    college_Name: string
    department: string
    year_of_study: number
    interest?: string[]
    profileIMG?: string
    bannerIMG?: string
    role: "student" | "clubMember" | "admin"
    aboutMe?: string
}
