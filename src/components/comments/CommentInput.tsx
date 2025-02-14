import { PostData } from "@/lib/types";
import { useSubmitCommentMutation } from "./mutation";
import { useState } from "react";
import { Input } from "../ui/input";
import { Loader2, SendHorizontal } from "lucide-react"; // İkon ismini kontrol edin, örneğin "SendHorizontal"
import { Button } from "../ui/button";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");
  const mutation = useSubmitCommentMutation(post.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    mutation.mutate(
      { post, content: input },
      {
        onSuccess: () => {
          setInput("");
        },
      },
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!input.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizontal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
