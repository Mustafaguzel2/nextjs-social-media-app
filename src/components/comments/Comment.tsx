import { CommentData } from "@/lib/types";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      {/* Küçük ekranlarda avatar gösterimi */}
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              className="font-medium hover:underline"
              href={`/users/${comment.user.username}`}
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <div>{comment.content}</div>
      </div>
      {comment.user.id === user.id && (
        <CommentMoreButton
          comment={comment}
          className="group-hover/comment:opacity-100 ms-auto opacity-0 transition-opacity"
        ></CommentMoreButton>
      )}
    </div>
  );
}
