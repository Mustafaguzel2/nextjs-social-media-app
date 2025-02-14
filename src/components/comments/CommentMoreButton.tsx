import { CommentData } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import DeleteCommentDialog from "./DeleteCommentDialog";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

export default function CommentMoreButton({
  comment,
  className,
}: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="w-5 h-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCommentDialog
        comment={comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
