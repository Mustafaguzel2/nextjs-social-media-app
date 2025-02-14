import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { unstable_cache } from "next/cache";
import { formatNumber } from "@/lib/utils";
import FollowButton from "./FollowButton";
import { getUserDataSelect } from "@/lib/types";
import UserTooltip from "./UserTooltip";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) {
    return null;
  }

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <UserTooltip user={user}>
            <Link
              href={`/users/${user.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.displayName}
                </p>
                <p className="line-clamp1- break-all text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
        SELECT LOWER(unnest(regexp_matches(content, '#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]+', 'g'))) AS hashtag,
               COUNT(*) AS count
        FROM posts
        WHERE content ~ '#[a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]'
        GROUP BY hashtag
        ORDER BY count DESC, hashtag ASC
        LIMIT 5
      `;
    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count), // Convert count from bigint to number
    }));
  },
  ["trending-topics"],
  {
    revalidate: 3 * 60 * 60, // Cache for 3 hours
  },
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Topics</div>
      {trendingTopics.length === 0 ? (
        <p>No trending topics available</p>
      ) : (
        trendingTopics.map(({ hashtag, count }) => {
          const title = hashtag.split("#")[1]; // Remove the '#' character

          return (
            <Link key={title} href={`/hashtag/${title}`} className="block">
              <p
                className="line-clamp-1 break-all font-semibold hover:underline"
                title={hashtag}
              >
                {hashtag}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(count)} {count === 1 ? "post" : "posts"}
              </p>
            </Link>
          );
        })
      )}
    </div>
  );
}
