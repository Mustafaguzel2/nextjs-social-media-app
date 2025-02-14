import { useToast } from "@/hooks/use-toast";
import {
  useQueryClient,
  useMutation,
  InfiniteData,
} from "@tanstack/react-query";
import { deleteComment, submitComment } from "./action";
import { CommentData, CommentsPage } from "@/lib/types";

export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey = ["comments", postId];
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData?.pageParams,
              pages: [
                {
                  previousCursor: firstPage.previousCursor,
                  comments: [...firstPage.comments, newComment],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
      toast({
        description: "Comment submitted successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to submit comment. Please try again.",
      });
    },
  });
  return mutation;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useDeleteCommentMutation(comment: CommentData) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey = ["comments", deletedComment.postId];
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter(
                (comment) => comment.id !== deletedComment.id,
              ),
            })),
          };
        },
      );
      toast({
        description: "Comment deleted successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });
  return mutation;
}
