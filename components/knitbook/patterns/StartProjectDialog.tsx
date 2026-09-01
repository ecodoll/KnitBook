"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StartProjectDialogProps = {
  patternId: string;
  defaultTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * 선택한 도안으로 작품 생성 화면으로 이동한다.
 */
const StartProjectDialog = ({
  patternId,
  defaultTitle,
  open,
  onOpenChange,
}: StartProjectDialogProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }

    const params = new URLSearchParams({
      patternId,
      title: title.trim(),
    });
    onOpenChange(false);
    router.push(`/projects/new?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이 도안으로 작품 시작</DialogTitle>
          <DialogDescription>
            작품 이름을 정한 뒤 사용할 실을 연결할 수 있어요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="project-title">작품 이름</Label>
          <Input
            id="project-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={!title.trim()}
          onClick={handleSubmit}
        >
          이어서 실 고르기
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default StartProjectDialog;
