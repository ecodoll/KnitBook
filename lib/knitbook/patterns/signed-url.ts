import {
  PATTERN_PDF_BUCKET,
  PATTERN_SIGNED_URL_TTL,
} from "@/lib/knitbook/patterns/constants";

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
 * http(s)로 시작하는 공개 URL인지 확인한다.
 */
const isHttpUrl = (value: string | null | undefined): value is string => {
  return typeof value === "string" && /^https?:\/\//i.test(value);
};

/**
 * Storage 경로 하나에 대한 서명 URL을 만든다.
 */
const createSignedStorageUrl = async (
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
    .from(PATTERN_PDF_BUCKET)
    .createSignedUrl(storagePath, PATTERN_SIGNED_URL_TTL);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[스토리지 서명 URL 생성 실패]", error.message);
    }
    return undefined;
  }

  return data?.signedUrl;
};

/**
 * 표지 Storage 경로 배열을 표시용 서명 URL 배열로 변환한다.
 */
const createSignedCoverUrls = async (
  supabase: StorageSigner,
  coverPaths: Array<string | null | undefined>
): Promise<Array<string | undefined>> => {
  const uniquePaths = [
    ...new Set(
      coverPaths.filter(
        (path): path is string => Boolean(path) && !isHttpUrl(path)
      )
    ),
  ];

  const signedByPath = new Map<string, string>();

  for (const path of coverPaths) {
    if (path && isHttpUrl(path)) {
      signedByPath.set(path, path);
    }
  }

  if (uniquePaths.length > 0) {
    const { data, error } = await supabase.storage
      .from(PATTERN_PDF_BUCKET)
      .createSignedUrls(uniquePaths, PATTERN_SIGNED_URL_TTL);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[표지 서명 URL 생성 실패]", error.message);
      }
    } else {
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) {
          signedByPath.set(item.path, item.signedUrl);
        }
      }
    }
  }

  return coverPaths.map((path) => (path ? signedByPath.get(path) : undefined));
};

export { isHttpUrl, createSignedStorageUrl, createSignedCoverUrls };
