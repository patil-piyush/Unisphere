export type CommentWithReplies = {
    _id: string
    user: { name: string; avatar?: string }
    content: string
    createdAt: string
    likesCount: number
    parent_comment_id?: string | null
    replies: CommentWithReplies[]
}
