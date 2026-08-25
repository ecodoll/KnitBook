"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renamePattern } from "@/lib/knitbook/pattern-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";

type RenamePatternDialogProps = {
  patternId: string;
  currentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed: (title: string) => void;
};

/**
 * 도안 이름을 변경하는 다이얼로그를 제공한다.
 */
const RenamePatternDialog = ({
  patternId,
  currentTitle,
  open,
  onOpenChange,
  onRenamed,
}: RenamePatternDialogProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(currentTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
    }
  }, [open, currentTitle]);

  const handleSubmit = async () => {
    const nextTitle = title.trim();
    if (!nextTitle || nextTitle === currentTitle.trim()) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await renamePattern(patternId, nextTitle);
      onRenamed(updated.title);
      showSuccessToast("도안 이름을 바꿨어요");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      showNetworkErrorToast(error, "도안 이름을 바꾸지 못했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>도안 이름 변경</DialogTitle>
          <DialogDescription>
            목록과 뷰어에 표시되는 이름을 바꿔요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pattern-rename-title">도안 이름</Label>
          <Input
            id="pattern-rename-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={isSubmitting || !title.trim()}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              저장 중…
            </>
          ) : (
            "이름 저장"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RenamePatternDialog;
