"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera } from "lucide-react";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  PROFILE_IMAGE_ACCEPT,
  PROFILE_NICKNAME_MAX_LENGTH,
} from "@/lib/knitbook/profile/constants";
import {
  resolveProfileImageUrl,
  updateProfile,
} from "@/lib/knitbook/profile-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";

type EditProfileDialogProps = {
  open: boolean;
  nickname: string;
  avatarPath?: string;
  onOpenChange: (open: boolean) => void;
  onUpdated: (next: { nickname: string; avatarPath?: string }) => void;
};

type EditProfileFormProps = {
  nickname: string;
  avatarPath?: string;
  onOpenChange: (open: boolean) => void;
  onUpdated: (next: { nickname: string; avatarPath?: string }) => void;
};

/**
 * 프로필 편집 폼을 렌더링한다. 팝업이 열릴 때마다 새로 마운트된다.
 */
const EditProfileForm = ({
  nickname,
  avatarPath,
  onOpenChange,
  onUpdated,
}: EditProfileFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | undefined>(undefined);
  const [nextNickname, setNextNickname] = useState(nickname);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarPath) {
      return;
    }

    let cancelled = false;

    const loadAvatar = async () => {
      try {
        const url = await resolveProfileImageUrl(avatarPath);
        if (!cancelled && url) {
          setCurrentAvatarUrl(url);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[프로필 사진 미리보기 실패]", error);
        }
      }
    };

    void loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [avatarPath]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  /**
   * 선택한 프로필 사진의 미리보기를 갱신한다.
   */
  const replacePhoto = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = undefined;
    }

    const nextUrl = file ? URL.createObjectURL(file) : undefined;
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setPhoto(file);
  };

  const displayUrl = previewUrl ?? currentAvatarUrl;
  const initial = nextNickname.trim().slice(0, 1) || "?";
  const trimmedNickname = nextNickname.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!trimmedNickname) {
      setErrorMessage("닉네임을 입력해 주세요.");
      return;
    }
    if (trimmedNickname.length > PROFILE_NICKNAME_MAX_LENGTH) {
      setErrorMessage(
        `닉네임은 ${PROFILE_NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`
      );
      return;
    }
    if (trimmedNickname === nickname.trim() && !photo) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProfile({
        nickname: trimmedNickname,
        photo,
      });
      onUpdated(updated);
      showSuccessToast("프로필을 저장했어요");
      onOpenChange(false);
    } catch (error) {
      showNetworkErrorToast(error, "프로필을 저장하지 못했어요");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <ErrorState title="프로필을 저장하지 못했어요" message={errorMessage} />
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="relative rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting}
          aria-label="프로필 사진 바꾸기"
        >
          <Avatar className="size-20 after:rounded-full">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 미리보기·스토리지 URL 대응
              <img
                src={displayUrl}
                alt=""
                className="aspect-square size-full rounded-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg">{initial}</AvatarFallback>
            )}
          </Avatar>
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-2 ring-popover">
            <Camera className="size-3.5" aria-hidden />
          </span>
        </button>
        <input
          ref={fileInputRef}
          id="profile-photo"
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            replacePhoto(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
          disabled={isSubmitting}
        />
        <p className="text-center text-xs text-muted-foreground">
          사진을 눌러 바꿀 수 있어요. JPEG, PNG, WebP를 올려 주세요.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-nickname">닉네임</Label>
        <Input
          id="profile-nickname"
          autoComplete="nickname"
          value={nextNickname}
          maxLength={PROFILE_NICKNAME_MAX_LENGTH}
          onChange={(event) => setNextNickname(event.target.value)}
          placeholder="뜨개 닉네임"
          required
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !trimmedNickname}
      >
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            저장 중…
          </>
        ) : (
          "프로필 저장"
        )}
      </Button>
    </form>
  );
};

/**
 * 프로필 사진과 닉네임을 바꾸는 팝업 카드를 제공한다.
 */
const EditProfileDialog = ({
  open,
  nickname,
  avatarPath,
  onOpenChange,
  onUpdated,
}: EditProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
          <DialogDescription>
            프로필 사진과 닉네임을 바꿀 수 있어요.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <EditProfileForm
            nickname={nickname}
            avatarPath={avatarPath}
            onOpenChange={onOpenChange}
            onUpdated={onUpdated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
