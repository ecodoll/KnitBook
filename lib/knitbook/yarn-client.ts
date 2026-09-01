"use client";

import type { Yarn } from "@/components/knitbook/types";
import type { YarnFormValues } from "@/components/knitbook/yarns/YarnForm";
import { YARN_SELECT } from "@/lib/knitbook/yarns/constants";
import { mapYarn, type YarnRow } from "@/lib/knitbook/yarns/map-yarn";
import { createClient } from "@/lib/supabase/client";

type YarnWritePayload = {
  brand: string;
  product_name: string;
  product_code: string | null;
  color_name: string | null;
  color_code: string | null;
  lot_number: string | null;
  material: string | null;
  weight_gram: number | null;
  length_meter: number | null;
  thickness: string | null;
  recommended_needle: string | null;
  quantity: number;
  remaining_weight: number | null;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_store: string | null;
  notes: string | null;
};

/**
 * 로그인 사용자 ID를 반환한다. 없으면 오류를 던진다.
 */
const requireUserId = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("로그인이 필요해요. 다시 로그인해 주세요.");
  }

  return { supabase, userId: user.id };
};

/**
 * 빈 문자열을 null로 바꾼다.
 */
const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

/**
 * 폼 숫자 입력을 number 또는 null로 변환한다.
 */
const parseOptionalNumber = (value: string, label: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label}은(는) 숫자로 입력해 주세요.`);
  }
  if (parsed < 0) {
    throw new Error(`${label}은(는) 0 이상이어야 해요.`);
  }
  return parsed;
};

/**
 * 실 등록/수정 폼 값을 DB payload로 변환한다.
 */
const toYarnWritePayload = (values: YarnFormValues): YarnWritePayload => {
  return {
    brand: values.brand.trim(),
    product_name: values.productName.trim(),
    product_code: emptyToNull(values.productCode),
    color_name: emptyToNull(values.colorName),
    color_code: emptyToNull(values.colorCode),
    lot_number: emptyToNull(values.lotNumber),
    material: emptyToNull(values.fiber),
    weight_gram: parseOptionalNumber(values.weightGrams, "중량"),
    length_meter: parseOptionalNumber(values.lengthMeters, "길이"),
    thickness: emptyToNull(values.yarnWeight),
    recommended_needle: emptyToNull(values.needleSizeMm),
    quantity: parseOptionalNumber(values.quantity, "수량") ?? 0,
    remaining_weight: parseOptionalNumber(values.remainingGrams, "남은 중량"),
    purchase_date: emptyToNull(values.purchaseDate),
    purchase_price: parseOptionalNumber(values.purchasePrice, "가격"),
    purchase_store: emptyToNull(values.purchaseStore),
    notes: emptyToNull(values.memo),
  };
};

/**
 * 사용자의 실 재고 목록을 조회한다.
 */
const fetchYarns = async (): Promise<Yarn[]> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("yarns")
    .select(YARN_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 목록 조회 실패]", error);
    }
    throw new Error("실 재고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return ((data ?? []) as YarnRow[]).map(mapYarn);
};

/**
 * 실 한 건의 상세 정보를 조회한다.
 */
const fetchYarnDetail = async (yarnId: string): Promise<Yarn> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("yarns")
    .select(YARN_SELECT)
    .eq("id", yarnId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 상세 조회 실패]", error);
    }
    throw new Error("실 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!data) {
    throw new Error("실 정보를 찾을 수 없어요.");
  }

  return mapYarn(data as YarnRow);
};

/**
 * 새 실 재고를 등록한다.
 */
const createYarn = async (values: YarnFormValues): Promise<Yarn> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("yarns")
    .insert({
      user_id: userId,
      ...toYarnWritePayload(values),
    })
    .select(YARN_SELECT)
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 등록 실패]", error);
    }
    throw new Error("실 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return mapYarn(data as YarnRow);
};

/**
 * 실 재고 정보를 수정한다.
 */
const updateYarn = async (yarnId: string, values: YarnFormValues): Promise<Yarn> => {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("yarns")
    .update(toYarnWritePayload(values))
    .eq("id", yarnId)
    .eq("user_id", userId)
    .select(YARN_SELECT)
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 수정 실패]", error);
    }
    throw new Error("실 정보를 수정하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return mapYarn(data as YarnRow);
};

/**
 * 남은 중량에서 사용한 양을 차감한다.
 */
const deductYarnStock = async (yarnId: string, grams: number): Promise<Yarn> => {
  if (!Number.isFinite(grams) || grams <= 0) {
    throw new Error("차감할 중량을 0보다 크게 입력해 주세요.");
  }

  const current = await fetchYarnDetail(yarnId);
  const remaining = current.remainingGrams;

  if (typeof remaining !== "number") {
    throw new Error("남은 중량이 없어요. 먼저 남은 중량을 입력해 주세요.");
  }

  if (grams > remaining) {
    throw new Error("남은 중량보다 많이 차감할 수 없어요.");
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("yarns")
    .update({ remaining_weight: remaining - grams })
    .eq("id", yarnId)
    .eq("user_id", userId)
    .select(YARN_SELECT)
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[재고 차감 실패]", error);
    }
    throw new Error("재고를 차감하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return mapYarn(data as YarnRow);
};

/**
 * 실 재고를 삭제한다.
 */
const deleteYarn = async (yarnId: string) => {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("yarns")
    .delete()
    .eq("id", yarnId)
    .eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 삭제 실패]", error);
    }
    throw new Error("실 정보를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
};

export {
  fetchYarns,
  fetchYarnDetail,
  createYarn,
  updateYarn,
  deductYarnStock,
  deleteYarn,
};
