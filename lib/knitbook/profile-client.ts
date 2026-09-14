"use client";

import { requireBrowserUser } from "@/lib/knitbook/auth-client";
import { getPasswordAuthErrorMessage } from "@/lib/knitbook/auth-errors";
import {
  buildProfileImagePath,
  mapProfileImageUploadError,
  PROFILE_IMAGE_BUCKETS,
  PROFILE_NICKNAME_MAX_LENGTH,
  PROFILE_SELECT,
} from "@/lib/knitbook/profile/constants";
import { prepareProfileImageFile } from "@/lib/knitbook/profile/prepare-image";
import { createSignedProfileImageUrl } from "@/lib/knitbook/profile/signed-url";
import { createClient } from "@/lib/supabase/client";

export type ProfileUpdateInput = {
  nickname: string;
  photo?: File | null;
};

export type ProfileUpdateResult = {
  nickname: string;
  avatarPath?: string;
};

/**
 * 비밀번호 재설정 메일이 돌아올 주소를 만든다.
 */
const getPasswordResetRedirectTo = () => {
  return `${window.location.origin}/auth/callback?next=/reset-password`;
};

/**
 * 프로필 사진 Storage 경로를 표시용 서명 URL로 만든다.
 */
const resolveProfileImageUrl = async (storagePath: string) => {
  const supabase = createClient();
  return createSignedProfileImageUrl(supabase, storagePath);
};

/**
 * 프로필 사진을 사용 가능한 Storage 버킷에 올린다.
 */
const uploadProfileImageToAvailableBucket = async (
  supabase: ReturnType<typeof createClient>,
  storagePath: string,
  body: Blob,
  contentType: string
) => {
  let lastError: { message?: string; statusCode?: string | number } | null = null;

  for (const bucket of PROFILE_IMAGE_BUCKETS) {
    const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });

    if (!error) {
      return;
    }

    lastError = error;
    if (process.env.NODE_ENV === "development") {
      console.error(`[프로필 사진 업로드 실패:${bucket}]`, error);
    }
  }

  throw new Error(mapProfileImageUploadError(lastError ?? {}));
};

/**
 * 이전 프로필 사진을 모든 후보 버킷에서 지운다.
 */
const removeProfileImageFromBuckets = async (
  supabase: ReturnType<typeof createClient>,
  storagePath: string
) => {
  for (const bucket of PROFILE_IMAGE_BUCKETS) {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error && process.env.NODE_ENV === "development") {
      console.error(`[프로필 사진 삭제 실패:${bucket}]`, error.message);
    }
  }
};

/**
 * 닉네임과 프로필 사진을 저장한다.
 */
const updateProfile = async (
  values: ProfileUpdateInput
): Promise<ProfileUpdateResult> => {
  const nickname = values.nickname.trim();
  if (!nickname) {
    throw new Error("닉네임을 입력해 주세요.");
  }
  if (nickname.length > PROFILE_NICKNAME_MAX_LENGTH) {
    throw new Error(`닉네임은 ${PROFILE_NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`);
  }

  const { supabase, userId } = await requireBrowserUser();
  let avatarPath: string | undefined;

  const { data: current, error: currentError } = await supabase
    .from("users")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (currentError && process.env.NODE_ENV === "development") {
    console.error("[프로필 조회 실패]", currentError);
  }

  const previousPath =
    typeof current?.profile_image === "string" ? current.profile_image : undefined;

  if (values.photo) {
    const prepared = await prepareProfileImageFile(values.photo);
    const storagePath = buildProfileImagePath(userId, prepared.extension);

    await uploadProfileImageToAvailableBucket(
      supabase,
      storagePath,
      prepared.body,
      prepared.contentType
    );

    if (previousPath && previousPath !== storagePath) {
      await removeProfileImageFromBuckets(supabase, previousPath);
    }

    avatarPath = storagePath;
  } else {
    avatarPath = previousPath;
  }

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({
      nickname,
      ...(avatarPath ? { profile_image: avatarPath } : {}),
    })
    .eq("id", userId)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (updateError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[프로필 저장 실패]", updateError);
    }
    throw new Error("프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!updated) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      email: user?.email ?? null,
      nickname,
      profile_image: avatarPath ?? null,
    });

    if (insertError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[프로필 생성 실패]", insertError);
      }
      throw new Error("프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      nickname,
      ...(avatarPath ? { avatar_path: avatarPath } : {}),
    },
  });

  if (metadataError && process.env.NODE_ENV === "development") {
    console.error("[프로필 메타데이터 저장 실패]", metadataError);
  }

  await supabase.auth.refreshSession();

  return {
    nickname,
    avatarPath,
  };
};

/**
 * 로그인된 사용자가 현재 비밀번호를 확인한 뒤 새 비밀번호로 바꾼다.
 */
const changePassword = async (currentPassword: string, newPassword: string) => {
  if (newPassword.length < 8) {
    throw new Error("비밀번호는 8자 이상으로 입력해 주세요.");
  }

  const { supabase } = await requireBrowserUser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    if (process.env.NODE_ENV === "development") {
      console.error("[비밀번호 변경 사용자 조회 실패]", userError);
    }
    throw new Error("로그인이 필요해요. 다시 로그인해 주세요.");
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[현재 비밀번호 확인 실패]", verifyError);
    }
    throw new Error(
      getPasswordAuthErrorMessage(verifyError, "현재 비밀번호가 올바르지 않아요.")
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[비밀번호 변경 실패]", updateError);
    }
    throw new Error(
      getPasswordAuthErrorMessage(
        updateError,
        "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."
      )
    );
  }
};

/**
 * 비밀번호 재설정 안내 메일을 보낸다.
 */
const requestPasswordReset = async (email: string) => {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("이메일을 입력해 주세요.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("이메일 형식을 확인해 주세요.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo: getPasswordResetRedirectTo(),
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[비밀번호 재설정 메일 발송 실패]", error);
    }
    throw new Error(
      getPasswordAuthErrorMessage(
        error,
        "재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요."
      )
    );
  }
};

/**
 * 재설정 링크로 들어온 세션에서 새 비밀번호를 저장한다.
 */
const updatePasswordAfterReset = async (newPassword: string) => {
  if (newPassword.length < 8) {
    throw new Error("비밀번호는 8자 이상으로 입력해 주세요.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[비밀번호 재설정 실패]", error);
    }
    throw new Error(
      getPasswordAuthErrorMessage(
        error,
        "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."
      )
    );
  }
};

export {
  changePassword,
  requestPasswordReset,
  resolveProfileImageUrl,
  updatePasswordAfterReset,
  updateProfile,
};
