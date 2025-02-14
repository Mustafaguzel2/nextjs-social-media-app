import prisma from "@/lib/prisma";
import { cache } from "react";
import { getUserDataSelect, UserData } from "@/lib/types";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import { Metadata } from "next";
import TrendsSidebar from "@/components/TrendsSidebar";
import { FollowerInfo } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { formatDate } from "date-fns";
import { formatNumber } from "@/lib/utils";
import FollowerCount from "@/components/FollowerCount";
import FollowButton from "@/components/FollowButton";
import UserPosts from "./UserPosts";
import Linkify from "@/components/Linkify";
import EditProfileButton from "./EditProfileButton";

// Updated PageProps: params is now a Promise resolving to an object with username
interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) {
    return notFound();
  }
  return user;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params to access the username
  const { username } = await params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return {};
  }

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user?.displayName} (@${user?.username})`,
  };
}

export default async function Page({ params }: PageProps) {
  // Await params to access the username
  const { username } = await params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-center text-destructive">
        You are not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  if (!user) {
    return <p className="text-center text-destructive">User not found.</p>;
  }

  return (
    <main className="mt-6 flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="flex w-full flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-sm">
      {/* Avatar */}
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={150}
        className="rounded-full shadow-lg"
      />

      {/* User Information */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{user.displayName}</h1>
        <p className="text-muted-foreground">@{user.username}</p>
      </div>

      {/* Member Since, Posts, Followers */}
      <div className="space-y-3 text-center">
        <p>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</p>
        <div className="flex justify-center gap-4">
          <span>
            Posts:{" "}
            <span className="font-semibold">
              {formatNumber(user._count.posts)}
            </span>
          </span>
          <FollowerCount userId={user.id} initialState={followerInfo} />
        </div>
      </div>

      {/* Edit Profile or Follow Button */}
      <div className="flex justify-center">
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <>
          <hr className="w-full" />
          <Linkify>
            <div className="whitespace-pre-line break-words px-4 text-center text-sm">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
