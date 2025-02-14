import { useToast } from "@/hooks/use-toast";
import { InfiniteData, QueryFilters, useMutation } from "@tanstack/react-query";
import { submitPost } from "./action";
import { useQueryClient } from "@tanstack/react-query";
import { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function useSubmitPostMutation() {
  const { toast } = useToast(); // Always called first
  const queryClient = useQueryClient(); // Always called second
  const { user } = useSession(); // Always called third

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user?.id))
          );
        },
      } satisfies QueryFilters;

      // Query updates and invalidation (no hooks are conditionally invoked)
      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData?.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      // Show a success toast
      toast({
        variant: "default",
        description: "Your post has been submitted.",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred. Please try again.",
      });
    },
  });

  return mutation;
}
