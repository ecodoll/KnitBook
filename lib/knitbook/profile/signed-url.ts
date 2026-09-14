import {
  PROFILE_IMAGE_BUCKETS,
  PROFILE_SIGNED_URL_TTL,
} from "@/lib/knitbook/profile/constants";
import { isHttpUrl } from "@/lib/knitbook/patterns/signed-url";

type StorageBucketApi = {
  createSignedUrl: (
    path: string,
    expiresIn: number
  ) => Promise<{
    data: { signedUrl: string } | null;
    error: { message: string } | null;
  }>;
};

type StorageSigner = {
  storage: {
    from: (bucket: string) => StorageBucketApi;
  };
};

/**
 * 프로필 사진 Storage 경로 하나에 대한 서명 URL을 만든다.
 */
const createSignedProfileImageUrl = async (
  supabase: StorageSigner,
  storagePath: string | null | undefined
): Promise<string | undefined> => {
  if (!storagePath) {
    return undefined;
  }

  if (isHttpUrl(storagePath)) {
    return storagePath;
  }

  let lastError: { message: string } | null = null;

  for (const bucket of PROFILE_IMAGE_BUCKETS) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, PROFILE_SIGNED_URL_TTL);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }

    lastError = error;
  }

  if (lastError && process.env.NODE_ENV === "development") {
    console.error("[프로필 사진 서명 URL 생성 실패]", lastError.message);
  }

  return undefined;
};

export { createSignedProfileImageUrl };
