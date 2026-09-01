import { cache } from "react";
import type { Yarn } from "@/components/knitbook/types";
import { getAuthUser } from "@/lib/knitbook/app-user";
import { YARN_SELECT } from "@/lib/knitbook/yarns/constants";
import { mapYarn, type YarnRow } from "@/lib/knitbook/yarns/map-yarn";
import { createClient } from "@/lib/supabase/server";

export type YarnsPageData = {
  yarns: Yarn[];
};

export type YarnDetailPageData = {
  yarn: Yarn;
};

/**
 * 로그인한 사용자의 실 재고 목록을 불러온다.
 */
const getYarnsPageData = cache(async (): Promise<YarnsPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("yarns")
    .select(YARN_SELECT)
    .eq("user_id", authUser.id)
    .order("updated_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 목록 조회 실패]", error.message);
    }
    throw new Error("실 재고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return {
    yarns: ((data ?? []) as YarnRow[]).map(mapYarn),
  };
});

/**
 * 실 상세 페이지 초기 데이터를 불러온다.
 */
const getYarnDetailPageData = cache(async (
  yarnId: string
): Promise<YarnDetailPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("yarns")
    .select(YARN_SELECT)
    .eq("id", yarnId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 상세 조회 실패]", error.message);
    }
    throw new Error("실 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (!data) {
    return null;
  }

  return {
    yarn: mapYarn(data as YarnRow),
  };
});

export { getYarnsPageData, getYarnDetailPageData };
