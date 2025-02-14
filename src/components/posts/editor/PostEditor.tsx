/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import PlaceHolder from "@tiptap/extension-placeholder";
import { submitPost } from "./action";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/SessionProvider";
import { EditorContent } from "@tiptap/react";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";
import { ClipboardEvent } from "react";
export default function PostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPostMutation();

  const {
    startUpload,
    attachments,
    removeAttachmet,
    reset: resetMediaUploads,
    isUploading,
    uploadProgress,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      PlaceHolder.configure({
        placeholder: "Write something...",
      }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";
  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
    .filter((item) => item.kind === 'file')
    .map(item => item.getAsFile()) as File[];
    startUpload(files);
  }

  return (
    <div className="my-6 rounded-xl bg-card p-5 shadow-lg">
      <div className="flex gap-4">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          className="hidden sm:inline-block"
        />
        <div {...rootProps} className="flex-grow">
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[70px] overflow-y-auto rounded-lg border border-gray-200 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500",
              isDragActive && "outline-dashed",
            )}
          />
          <input
            {...getInputProps()}
            className="hidden"
            accept="image/*,video/*"
          />
        </div>
      </div>
      {!!attachments.length && (
        <div className="mt-4">
          <AttachmentPreviewList
            attachments={attachments}
            removeAttachment={removeAttachmet}
          />
        </div>
      )}
      <div className="mt-6 flex items-center justify-end gap-4">
        {isUploading && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {uploadProgress ?? 0}%
            </span>
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          loading={mutation.isPending}
          onClick={onSubmit}
          disabled={!input.trim() || isUploading}
          className="min-h-11 min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20}></ImageIcon>
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewListProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviewList({
  attachments,
  removeAttachment,
}: AttachmentPreviewListProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);
  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment Preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] max-w-[30rem] rounded-2xl"
        />
      ) : (
        <video
          controls
          className="size-fit max-h-[30rem] max-w-[30rem] rounded-2xl"
        >
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-muted/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
