"use client";

import {
  getYarnImageExtension,
  normalizeYarnImageContentType,
  YARN_IMAGE_MAX_BYTES,
} from "@/lib/knitbook/yarns/constants";

const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.86;

export type PreparedYarnImage = {
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
          reject(new Error("사진을 변환하지 못했어요. 다른 사진으로 다시 시도해 주세요."));
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
 * 휴대폰 사진을 JPEG로 줄여 Storage 업로드가 실패하지 않게 한다.
 */
const compressYarnImage = async (file: File): Promise<Blob | null> => {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return null;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return await canvasToJpeg(canvas);
  } catch {
    return null;
  }
};

/**
 * 실 사진을 검사하고, 가능하면 JPEG로 변환해 업로드 본문을 만든다.
 */
const prepareYarnImageFile = async (file: File): Promise<PreparedYarnImage> => {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

  if (!isImage) {
    throw new Error("사진 파일만 올릴 수 있어요.");
  }

  const compressed = await compressYarnImage(file);
  if (compressed) {
    if (compressed.size > YARN_IMAGE_MAX_BYTES) {
      throw new Error("사진 용량은 8MB 이하로 올려 주세요.");
    }

    return {
      body: compressed,
      contentType: "image/jpeg",
      extension: "jpg",
    };
  }

  if (file.size > YARN_IMAGE_MAX_BYTES) {
    throw new Error("사진 용량은 8MB 이하로 올려 주세요.");
  }

  return {
    body: file,
    contentType: normalizeYarnImageContentType(file),
    extension: getYarnImageExtension(file),
  };
};

export { prepareYarnImageFile };
