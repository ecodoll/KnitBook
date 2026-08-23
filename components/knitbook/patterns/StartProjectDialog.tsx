"use client";

import { useState } from "react";
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
import { createProjectFromPattern } from "@/lib/knitbook/pattern-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";

type StartProjectDialogProps = {
  patternId: string;
  defaultTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * 선택한 도안으로 새 작품을 만드는 다이얼로그를 제공한다.
 */
const StartProjectDialog = ({
  patternId,
  defaultTitle,
  open,
  onOpenChange,
}: StartProjectDialogProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const project = await createProjectFromPattern(patternId, title);
      showSuccessToast("작품을 만들었어요", `"${project.title}" 작품을 시작할 수 있어요.`);
      onOpenChange(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      showNetworkErrorToast(error, "작품을 만들지 못했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이 도안으로 작품 시작</DialogTitle>
          <DialogDescription>
            작품 이름을 정하면 홈에서 진행 상황을 기록할 수 있어요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="project-title">작품 이름</Label>
          <Input
            id="project-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
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
              만드는 중…
            </>
          ) : (
            "작품 만들기"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default StartProjectDialog;
