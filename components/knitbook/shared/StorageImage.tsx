"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getCachedSignedUrl, rememberSignedUrl } from "@/lib/knitbook/signed-url-cache";
import { cn } from "@/lib/utils";

type StorageImageProps = {
  /** 이미 서명됐거나 공개된 표시 URL */
  src?: string;
  /** Storage 경로. src가 없을 때 클라이언트에서 서명한다. */
  storagePath?: string;
  /** Storage 경로를 표시용 URL로 바꾼다. */
  resolveUrl: (storagePath: string) => Promise<string | undefined>;
  alt: string;
  className?: string;
  fallback: ReactNode;
  /** 서명 URL 캐시 시간(ms). 기본 50분. */
  cacheTtlMs?: number;
};

/**
 * 공개 URL 또는 Storage 경로를 받아 이미지를 보여 준다.
 * 화면 전환을 막지 않도록 서명은 마운트 이후에 한다.
 */
const StorageImage = ({
  src,
  storagePath,
  resolveUrl,
  alt,
  className,
  fallback,
  cacheTtlMs = 50 * 60 * 1000,
}: StorageImageProps) => {
  const [resolved, setResolved] = useState<{ path: string; url: string }>();
  const [failedPath, setFailedPath] = useState<string>();
  const cachedSrc = storagePath ? getCachedSignedUrl(storagePath) : undefined;
  const resolvedSrc =
    src ??
    cachedSrc ??
    (resolved && resolved.path === storagePath ? resolved.url : undefined);
  const isResolving = !resolvedSrc && Boolean(storagePath) && failedPath !== storagePath;

  useEffect(() => {
    if (src || !storagePath || getCachedSignedUrl(storagePath)) {
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      try {
        const signed = await rememberSignedUrl(
          storagePath,
          () => resolveUrl(storagePath),
          cacheTtlMs
        );
        if (cancelled) {
          return;
        }
        if (signed) {
          setResolved({ path: storagePath, url: signed });
          return;
        }
        setFailedPath(storagePath);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[이미지 주소 만들기 실패]", error);
        }
        if (!cancelled) {
          setFailedPath(storagePath);
        }
      }
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [src, storagePath, resolveUrl, cacheTtlMs]);

  if (resolvedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 스토리지 서명 URL 대응
      <img src={resolvedSrc} alt={alt} className={className} />
    );
  }

  return (
    <span
      className={cn(
        "flex size-full items-center justify-center",
        isResolving && "animate-pulse"
      )}
    >
      {fallback}
    </span>
  );
};

export default StorageImage;
