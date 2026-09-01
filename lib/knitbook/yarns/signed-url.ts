import {
  YARN_IMAGE_BUCKET,
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

  const { data, error } = await supabase.storage
    .from(YARN_IMAGE_BUCKET)
    .createSignedUrl(storagePath, YARN_SIGNED_URL_TTL);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 사진 서명 URL 생성 실패]", error.message);
    }
    return undefined;
  }

  return data?.signedUrl;
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

  if (uniquePaths.length > 0) {
    const { data, error } = await supabase.storage
      .from(YARN_IMAGE_BUCKET)
      .createSignedUrls(uniquePaths, YARN_SIGNED_URL_TTL);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[실 사진 서명 URL 생성 실패]", error.message);
      }
    } else {
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) {
          signedByPath.set(item.path, item.signedUrl);
        }
      }
    }
  }

  return imagePaths.map((path) => (path ? signedByPath.get(path) : undefined));
};

export { createSignedYarnImageUrl, createSignedYarnImageUrls };
