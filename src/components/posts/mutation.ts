import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { deletePost } from "./action";
import { PostsPage } from "@/lib/types";
import { QueryFilters, InfiniteData } from "@tanstack/react-query";

export function useDeletePostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) {
            return;
          }
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((post) => post.id !== deletedPost.id),
            })),
          };
        },
      );
      toast ({
        description: "Post deleted successfully.",
      })
      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
}

