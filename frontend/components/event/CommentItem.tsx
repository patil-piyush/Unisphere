// components/event/CommentItem.tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle } from "lucide-react"

export type CommentWithReplies = {
    _id: string
    user?: { name: string; avatar?: string } | null
    content: string
    createdAt: string
    likesCount: number
    parent_comment_id?: string | null
    replies: CommentWithReplies[]
}


type CommentItemProps = {
    comment: CommentWithReplies
    onReply: (id: string) => void
    onLike: (id: string) => void
    onDelete: (id: string) => void
}

export function CommentItem({
    comment,
    onReply,
    onLike,
    onDelete,
}: CommentItemProps) {
    const time = new Date(comment.createdAt).toLocaleString()
    const name = comment.user?.name ?? "Unknown User"
    const avatar = comment.user?.avatar || "/placeholder.svg"
    const initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")

    return (
        <div className="space-y-3">
            <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{name}</span>
                        <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <button
                            className="flex items-center gap-1 hover:text-foreground"
                            onClick={() => onLike(comment._id)}
                        >
                            <Heart className="h-3 w-3" />
                            {comment.likesCount}
                        </button>
                        <button
                            className="flex items-center gap-1 hover:text-foreground"
                            onClick={() => onReply(comment._id)}
                        >
                            <MessageCircle className="h-3 w-3" />
                            Reply
                        </button>
                        <button
                            className="hover:text-destructive ml-auto"
                            onClick={() => onDelete(comment._id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {comment.replies.length > 0 && (
                <div className="ml-10 space-y-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            onReply={onReply}
                            onLike={onLike}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
