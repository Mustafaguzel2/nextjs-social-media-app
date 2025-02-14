"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";
import { QueryKey } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.log(error);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred. Please try again.",
      });
    },
  });

  return (
    <Button
      className={data?.isFollowedByUser ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}
      variant={data?.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data?.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
