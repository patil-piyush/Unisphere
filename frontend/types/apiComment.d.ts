export type ApiComment = {
    _id: string
    user_id: { name: string; profileIMG?: string }  // from populate
    event_id: string
    parent_comment_id?: string | null
    content: string
    likes: string[]            // array of user ids
    createdAt: string
}