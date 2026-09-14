"use client";

import { useState, type FormEvent } from "react";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { changePassword } from "@/lib/knitbook/profile-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SettingsFormProps = {
  onOpenChange: (open: boolean) => void;
};

/**
 * 비밀번호 변경 폼을 렌더링한다. 설정 팝업이 열릴 때마다 새로 마운트된다.
 */
const SettingsForm = ({ onOpenChange }: SettingsFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!currentPassword || !newPassword) {
      setErrorMessage("현재 비밀번호와 새 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("비밀번호는 8자 이상으로 입력해 주세요.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage("새 비밀번호가 서로 달라요. 다시 확인해 주세요.");
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMessage("지금과 다른 비밀번호로 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      showSuccessToast("비밀번호를 바꿨어요");
      onOpenChange(false);
    } catch (error) {
      showNetworkErrorToast(error, "비밀번호를 바꾸지 못했어요");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <ErrorState title="비밀번호를 바꾸지 못했어요" message={errorMessage} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="settings-current-password">현재 비밀번호</Label>
        <Input
          id="settings-current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-new-password">새 비밀번호</Label>
        <Input
          id="settings-new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="8자 이상"
          minLength={8}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-new-password-confirm">새 비밀번호 확인</Label>
        <Input
          id="settings-new-password-confirm"
          type="password"
          autoComplete="new-password"
          value={newPasswordConfirm}
          onChange={(event) => setNewPasswordConfirm(event.target.value)}
          placeholder="비밀번호를 한 번 더"
          minLength={8}
          required
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting || !currentPassword || !newPassword || !newPasswordConfirm
        }
      >
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            변경 중…
          </>
        ) : (
          "비밀번호 변경"
        )}
      </Button>
    </form>
  );
};

/**
 * 설정 팝업에서 비밀번호를 바꾸는 카드를 제공한다.
 */
const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
          <DialogDescription>
            로그인에 사용하는 비밀번호를 바꿀 수 있어요.
          </DialogDescription>
        </DialogHeader>
        {open ? <SettingsForm onOpenChange={onOpenChange} /> : null}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
