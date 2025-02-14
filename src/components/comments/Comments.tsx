import { CommentsPage, PostData } from "@/lib/types";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface CommentProps {
  post: PostData;
}

export default function Comments({ post }: CommentProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: async ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="space-y-4">
      <CommentInput post={post} />
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous comments
        </Button>
      )}

      {status === "pending" && (
        <p className="flex items-center justify-center text-gray-500">
          <Loader2Icon className="animate-spin" />
        </p>
      )}
      
      {status === "error" && (
        <p className="text-red-500">Failed to load comments.</p>
      )}

      {comments.length === 0 && status === "success" ? (
        <p className="text-center text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
