"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import PostsLoadingSkeleton from "@/components/posts/PostLoadingSkeleton";

export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const posts = data?.pages.flatMap((page) => page.posts) || [];
  console.log(posts);

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if(status === "success" && !posts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">
      No One Has Posted Anything Yet
    </p>
  }
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
