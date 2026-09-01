import type { Yarn } from "@/components/knitbook/types";
import { isHttpUrl } from "@/lib/knitbook/patterns/signed-url";

/** DB yarns 행 */
export type YarnRow = {
  id: string;
  brand: string;
  product_name: string;
  product_code?: string | null;
  color_name?: string | null;
  weight_gram?: number | string | null;
  remaining_weight?: number | string | null;
  yarn_image_url?: string | null;
  is_in_use?: boolean | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * 숫자형 DB 값을 number로 안전하게 변환한다.
 */
const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

/**
 * DB 실 행을 UI Yarn 타입으로 변환한다.
 */
const mapYarn = (row: YarnRow, signedImageUrl?: string): Yarn => {
  const imageRaw = row.yarn_image_url;
  const signedOrPublic =
    signedImageUrl ?? (isHttpUrl(imageRaw) ? imageRaw : undefined);
  const imageStoragePath =
    imageRaw && !isHttpUrl(imageRaw) ? imageRaw : undefined;

  return {
    id: row.id,
    brand: row.brand,
    productName: row.product_name,
    productCode: row.product_code ?? undefined,
    colorName: row.color_name ?? undefined,
    weightGrams: toNumber(row.weight_gram),
    remainingGrams: toNumber(row.remaining_weight),
    notes: row.notes ?? undefined,
    imageUrl: signedOrPublic,
    imageStoragePath,
    isInUse: row.is_in_use ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export { mapYarn, toNumber };
