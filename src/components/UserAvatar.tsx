import Image from "next/image";
import AvatarIcon2 from "@/assets/avatar-placeholder.png"; // Ensure this is a valid static import // This is an icon component
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null | undefined;
  className?: string;
  size?: number;
}

export default function UserAvatar({
  avatarUrl,
  className,
  size,
}: UserAvatarProps) { 

  return (
    <div className={cn("flex items-center", className)}>
      
        <Image
          src={avatarUrl || AvatarIcon2}
          alt="User avatar"
          width={size ?? 48}
          height={size ?? 48}
          className={cn(
            "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
            className,
          )}
        />
      
    </div>
  );
}
