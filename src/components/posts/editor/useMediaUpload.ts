import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((attachment) => {
          const uploadResult = res.find((r) => r.name === attachment.file.name);
          if (!uploadResult) return attachment;
          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );
    },
    onUploadError(e) {
      setAttachments((prev) =>
        prev.filter((attachment) => !attachment.isUploading),
      );
      toast({
        variant: "destructive",
        description: e.message,
      });
    },
  });
  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait until the current upload is complete.",
      });
      return;
    }
    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can upload a maximum of 5 files.",
      });
      return;
    }
    startUpload(files);
  }
  function removeAttachmet(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }
  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }
  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachmet,
    reset,
  };
}
