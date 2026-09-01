"use client";

import type { Yarn } from "@/components/knitbook/types";
import type { YarnFormValues } from "@/components/knitbook/yarns/YarnForm";
import {
  buildYarnImagePath,
  getYarnImageExtension,
  YARN_IMAGE_BUCKET,
  YARN_IMAGE_MAX_BYTES,
  YARN_SELECT,
} from "@/lib/knitbook/yarns/constants";
import { mapYarn, type YarnRow } from "@/lib/knitbook/yarns/map-yarn";
import {
  createSignedYarnImageUrl,
  createSignedYarnImageUrls,
} from "@/lib/knitbook/yarns/signed-url";
import { createClient } from "@/lib/supabase/client";

type YarnWritePayload = {
  brand: string;
  product_name: string;
  product_code: string | null;
  color_name: string | null;
  weight_gram: number | null;
  remaining_weight: number | null;
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
 * 실 사진 파일이 허용된 이미지인지 검사한다.
 */
const assertYarnImageFile = (file: File) => {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

  if (!isImage) {
    throw new Error("사진 파일만 올릴 수 있어요.");
  }

  if (file.size > YARN_IMAGE_MAX_BYTES) {
    throw new Error("사진 용량은 8MB 이하로 올려 주세요.");
  }
};

/**
 * 실 등록/수정 폼 값을 DB payload로 변환한다.
 */
const toYarnWritePayload = (values: YarnFormValues): YarnWritePayload => {
  const weightGram = parseOptionalNumber(values.weightGrams, "무게");
  const remainingWeight =
    parseOptionalNumber(values.remainingGrams, "남은 무게") ?? weightGram;

  if (
    weightGram !== null &&
    remainingWeight !== null &&
    remainingWeight > weightGram
  ) {
    throw new Error("남은 무게는 전체 무게보다 클 수 없어요.");
  }

  return {
    brand: values.brand.trim(),
    product_name: values.productName.trim(),
    product_code: emptyToNull(values.productCode),
    color_name: emptyToNull(values.colorName),
    weight_gram: weightGram,
    remaining_weight: remainingWeight,
    notes: emptyToNull(values.memo),
  };
};

/**
 * DB 실 행에 사진 서명 URL을 붙여 반환한다.
 */
const mapYarnWithImage = async (
  supabase: ReturnType<typeof createClient>,
  row: YarnRow
): Promise<Yarn> => {
  const yarn = mapYarn(row);
  const imageUrl = await createSignedYarnImageUrl(
    supabase,
    yarn.imageStoragePath ?? yarn.imageUrl
  );
  return { ...yarn, imageUrl: imageUrl ?? yarn.imageUrl };
};

/**
 * 실 사진을 Storage에 올리고 DB 경로를 갱신한다.
 */
const uploadYarnImage = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  yarnId: string,
  file: File,
  previousPath?: string
) => {
  assertYarnImageFile(file);

  const extension = getYarnImageExtension(file);
  const storagePath = buildYarnImagePath(userId, yarnId, extension);
  const contentType = file.type.startsWith("image/")
    ? file.type
    : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(YARN_IMAGE_BUCKET)
    .upload(storagePath, file, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 사진 업로드 실패]", uploadError);
    }
    throw new Error("실 사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (previousPath && previousPath !== storagePath) {
    const { error: removeError } = await supabase.storage
      .from(YARN_IMAGE_BUCKET)
      .remove([previousPath]);

    if (removeError && process.env.NODE_ENV === "development") {
      console.error("[이전 실 사진 삭제 실패]", removeError);
    }
  }

  const { data, error } = await supabase
    .from("yarns")
    .update({ yarn_image_url: storagePath })
    .eq("id", yarnId)
    .eq("user_id", userId)
    .select(YARN_SELECT)
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 사진 경로 저장 실패]", error);
    }
    throw new Error("실 사진을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return mapYarnWithImage(supabase, data as YarnRow);
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

  const rows = (data ?? []) as YarnRow[];
  const mapped = rows.map((row) => mapYarn(row));
  const signedUrls = await createSignedYarnImageUrls(
    supabase,
    mapped.map((yarn) => yarn.imageStoragePath ?? yarn.imageUrl)
  );

  return mapped.map((yarn, index) => ({
    ...yarn,
    imageUrl: signedUrls[index] ?? yarn.imageUrl,
  }));
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

  return mapYarnWithImage(supabase, data as YarnRow);
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

  const row = data as YarnRow;

  if (values.photo) {
    try {
      return await uploadYarnImage(supabase, userId, row.id, values.photo);
    } catch (photoError) {
      await supabase.from("yarns").delete().eq("id", row.id).eq("user_id", userId);
      throw photoError;
    }
  }

  return mapYarnWithImage(supabase, row);
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

  const row = data as YarnRow;
  const current = mapYarn(row);

  if (values.photo) {
    return uploadYarnImage(
      supabase,
      userId,
      yarnId,
      values.photo,
      current.imageStoragePath
    );
  }

  return mapYarnWithImage(supabase, row);
};

/**
 * 남은 무게에서 사용한 양을 차감한다.
 */
const deductYarnStock = async (yarnId: string, grams: number): Promise<Yarn> => {
  if (!Number.isFinite(grams) || grams <= 0) {
    throw new Error("차감할 무게를 0보다 크게 입력해 주세요.");
  }

  const current = await fetchYarnDetail(yarnId);
  const remaining = current.remainingGrams;

  if (typeof remaining !== "number") {
    throw new Error("남은 무게가 없어요. 먼저 남은 무게를 입력해 주세요.");
  }

  if (grams > remaining) {
    throw new Error("남은 무게보다 많이 차감할 수 없어요.");
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

  return mapYarnWithImage(supabase, data as YarnRow);
};

/**
 * 실 재고와 사진을 삭제한다.
 */
const deleteYarn = async (yarnId: string) => {
  const { supabase, userId } = await requireUserId();
  const current = await fetchYarnDetail(yarnId);

  if (current.imageStoragePath) {
    const { error: storageError } = await supabase.storage
      .from(YARN_IMAGE_BUCKET)
      .remove([current.imageStoragePath]);

    if (storageError && process.env.NODE_ENV === "development") {
      console.error("[실 사진 삭제 실패]", storageError.message);
    }
  }

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
