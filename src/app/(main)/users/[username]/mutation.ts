import { useToast } from "@/hooks/use-toast";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./action";
import { PostsPage } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing";

export function useUpdateProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use the "avatar" endpoint defined in your file router
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar: File | null;
    }) => {
      // Now updateUserProfile returns the updated user with an "id" property
      return Promise.all([
        updateUserProfile(values),
        avatar ? startAvatarUpload([avatar]) : null,
      ]);
    },
    onSuccess: async ([updatedUser, uploadResult]) => {
      // Access the avatar URL from the returned serverData
      const newAvatarUrl = uploadResult?.[0]?.serverData?.avatarUrl;
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...post.user,
                      avatarUrl: newAvatarUrl || post.user.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        }
      );
      router.refresh();
      toast({
        description: "Profile updated successfully.",
      });
    },
    onError(error) {
      console.error("Mutation error:", error);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred. Please try again.",
      });
    },
  });
  return mutation;
}
