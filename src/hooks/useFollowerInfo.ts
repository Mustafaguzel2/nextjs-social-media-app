import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  return useQuery({
    queryKey: ["follower-info", userId],
    queryFn: async () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });
}
