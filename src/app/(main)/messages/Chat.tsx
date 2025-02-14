"use client";

import { Loader2 } from "lucide-react";
import useInitializeChatClient from "./useInitializeChatClient";
import { Chat as StreamChat } from "stream-chat-react";
import ChatSidebar from "./ChatSidebar";
import ChatChannel from "./ChatChannel";
import { useTheme } from "next-themes";
import { useState } from "react";
export default function Chat() {
  const chatClient = useInitializeChatClient();

  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }
  return (
    <main className="relative mb-4 mt-6 w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="absolute flex h-full w-full">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatChannel
            open={!sidebarOpen}
            openSidebar={() => setSidebarOpen(true)}
          />
        </StreamChat>
      </div>
    </main>
  );
}
