import {
  YARN_IMAGE_BUCKETS,
  YARN_SIGNED_URL_TTL,
} from "@/lib/knitbook/yarns/constants";
import { isHttpUrl } from "@/lib/knitbook/patterns/signed-url";

type SignedUrlItem = {
  path: string | null;
  signedUrl: string | null;
};

type StorageBucketApi = {
  createSignedUrl: (
    path: string,
    expiresIn: number
  ) => Promise<{
    data: { signedUrl: string } | null;
    error: { message: string } | null;
  }>;
  createSignedUrls: (
    paths: string[],
    expiresIn: number
  ) => Promise<{
    data: SignedUrlItem[] | null;
    error: { message: string } | null;
  }>;
};

type StorageSigner = {
  storage: {
    from: (bucket: string) => StorageBucketApi;
  };
};

/**
 * 실 사진 Storage 경로 하나에 대한 서명 URL을 만든다.
 */
const createSignedYarnImageUrl = async (
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

  for (const bucket of YARN_IMAGE_BUCKETS) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, YARN_SIGNED_URL_TTL);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }

    lastError = error;
  }

  if (lastError && process.env.NODE_ENV === "development") {
    console.error("[실 사진 서명 URL 생성 실패]", lastError.message);
  }

  return undefined;
};

/**
 * 여러 실 사진 경로를 표시용 서명 URL로 변환한다.
 */
const createSignedYarnImageUrls = async (
  supabase: StorageSigner,
  imagePaths: Array<string | null | undefined>
): Promise<Array<string | undefined>> => {
  const uniquePaths = [
    ...new Set(
      imagePaths.filter(
        (path): path is string => Boolean(path) && !isHttpUrl(path)
      )
    ),
  ];

  const signedByPath = new Map<string, string>();

  for (const path of imagePaths) {
    if (path && isHttpUrl(path)) {
      signedByPath.set(path, path);
    }
  }

  for (const bucket of YARN_IMAGE_BUCKETS) {
    const remaining = uniquePaths.filter((path) => !signedByPath.has(path));
    if (remaining.length === 0) {
      break;
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(remaining, YARN_SIGNED_URL_TTL);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[실 사진 서명 URL 생성 실패]", error.message);
      }
      continue;
    }

    for (const item of data ?? []) {
      if (item.path && item.signedUrl) {
        signedByPath.set(item.path, item.signedUrl);
      }
    }
  }

  return imagePaths.map((path) => (path ? signedByPath.get(path) : undefined));
};

export { createSignedYarnImageUrl, createSignedYarnImageUrls };
