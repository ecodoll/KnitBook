import type { Yarn } from "@/components/knitbook/types";

/** DB yarns 행 */
export type YarnRow = {
  id: string;
  brand: string;
  product_name: string;
  product_code?: string | null;
  color_name?: string | null;
  color_code?: string | null;
  lot_number?: string | null;
  material?: string | null;
  weight_gram?: number | string | null;
  length_meter?: number | string | null;
  thickness?: string | null;
  recommended_needle?: string | null;
  quantity?: number | string | null;
  remaining_weight?: number | string | null;
  purchase_date?: string | null;
  purchase_price?: number | string | null;
  purchase_store?: string | null;
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
const mapYarn = (row: YarnRow): Yarn => {
  return {
    id: row.id,
    brand: row.brand,
    productName: row.product_name,
    productCode: row.product_code ?? undefined,
    colorName: row.color_name ?? undefined,
    colorCode: row.color_code ?? undefined,
    lotNumber: row.lot_number ?? undefined,
    fiber: row.material ?? undefined,
    weightGrams: toNumber(row.weight_gram),
    lengthMeters: toNumber(row.length_meter),
    remainingGrams: toNumber(row.remaining_weight),
    quantity: toNumber(row.quantity),
    yarnWeight: row.thickness ?? undefined,
    needleSizeMm: row.recommended_needle ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    purchasePrice: toNumber(row.purchase_price),
    purchaseStore: row.purchase_store ?? undefined,
    notes: row.notes ?? undefined,
    imageUrl: row.yarn_image_url ?? undefined,
    isInUse: row.is_in_use ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export { mapYarn, toNumber };
