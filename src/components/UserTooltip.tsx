'use client';
import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { PropsWithChildren } from "react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import Linkify from "./Linkify";
import FollowerCount from "./FollowerCount";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip({ children, user }: UserTooltipProps) {
  const { user: loggedInUser } = useSession();

  const followerState: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: !!user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id,
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="md:min-w-25 flex max-w-60 flex-col gap-3 break-words px-1 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/users/${user.username}`}>
                <UserAvatar size={70} avatarUrl={user.avatarUrl} />{" "}
              </Link>
              {loggedInUser.id !== user.id && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>
          </div>
          <div className="gap-2">
            <Link href={`/users/${user.username}`}>
              <div className="text-lg font-semibold hover:underline">
                {user.displayName}
              </div>
              <div className="text-muted">@${user.username}</div>
            </Link>
          </div>
          {user.bio && (
            <Linkify>
              <div className="line-clamp-4 whitespace-pre-line mb-3">{user.bio}</div>
            </Linkify>
          )}
          <FollowerCount userId={user.id} initialState={followerState} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
