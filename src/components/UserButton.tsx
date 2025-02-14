"use client";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { UserIcon, LogOutIcon, Monitor, Sun, Moon, Check } from "lucide-react";
import { logout } from "@/app/(auth)/action";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { DropdownMenuPortal } from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  
  // To avoid hydration mismatch, we wait until the component is mounted on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Trigger client-side rendering
  }, []);

  // If not mounted or user is not available, render nothing (or loading spinner)
  if (!mounted || !user) {
    return null; // Optionally, a loading spinner can be shown here
  }

  // Only render this component after it's mounted to avoid SSR issues
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("relative h-8 w-8 rounded-full", className)}>
          <UserAvatar avatarUrl={user?.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Logged in as @{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/users/${user?.username}`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 h-4 w-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("system");
                }}
              >
                <Monitor className="mr-2 h-4 w-4" />
                System Default
                {theme === "system" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setTheme("light");
                }}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
                {theme === "light" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setTheme("dark");
                }}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            queryClient.clear();
            logout();
          }}
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
