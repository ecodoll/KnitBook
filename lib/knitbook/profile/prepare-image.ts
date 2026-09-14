"use client";

import { PROFILE_IMAGE_MAX_BYTES } from "@/lib/knitbook/profile/constants";

const AVATAR_EDGE = 720;
const JPEG_QUALITY = 0.86;

export type PreparedProfileImage = {
  body: Blob;
  contentType: string;
  extension: string;
};

/**
 * 캔버스 내용을 JPEG Blob으로 내보낸다.
 */
const canvasToJpeg = (canvas: HTMLCanvasElement) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error("사진을 변환하지 못했어요. 다른 사진으로 다시 시도해 주세요.")
          );
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
};

/**
 * 프로필 사진을 정사각 JPEG로 줄여 Storage 업로드가 실패하지 않게 한다.
 */
const compressProfileImage = async (file: File): Promise<Blob | null> => {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const crop = Math.min(bitmap.width, bitmap.height);
    const sx = Math.max(0, Math.round((bitmap.width - crop) / 2));
    const sy = Math.max(0, Math.round((bitmap.height - crop) / 2));
    const size = Math.min(AVATAR_EDGE, crop);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return null;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.drawImage(bitmap, sx, sy, crop, crop, 0, 0, size, size);
    bitmap.close();
    return await canvasToJpeg(canvas);
  } catch {
    return null;
  }
};

/**
 * 프로필 사진을 검사하고, 가능하면 정사각 JPEG로 변환해 업로드 본문을 만든다.
 */
const prepareProfileImageFile = async (
  file: File
): Promise<PreparedProfileImage> => {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

  if (!isImage) {
    throw new Error("사진 파일만 올릴 수 있어요.");
  }

  const compressed = await compressProfileImage(file);
  if (compressed) {
    if (compressed.size > PROFILE_IMAGE_MAX_BYTES) {
      throw new Error("사진 용량은 8MB 이하로 올려 주세요.");
    }

    return {
      body: compressed,
      contentType: "image/jpeg",
      extension: "jpg",
    };
  }

  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    throw new Error("사진 용량은 8MB 이하로 올려 주세요.");
  }

  return {
    body: file,
    contentType: file.type.startsWith("image/") ? file.type : "image/jpeg",
    extension: "jpg",
  };
};

export { prepareProfileImageFile };
