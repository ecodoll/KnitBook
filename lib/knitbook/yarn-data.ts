import { cache } from "react";
import type { Yarn } from "@/components/knitbook/types";
import { getAuthUser } from "@/lib/knitbook/app-user";
import { retryAsync } from "@/lib/knitbook/retry";
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
 * yarns 테이블에서 사용자 재고 행을 읽는다.
 */
const queryYarnRows = async (userId: string) => {
  const supabase = await createClient();
  return supabase
    .from("yarns")
    .select(YARN_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
};

/**
 * 로그인한 사용자의 실 재고 목록을 불러온다.
 * 사진 서명은 카드에서 처리해 목록 전환을 막지 않는다.
 * 첫 요청의 일시 실패는 한 번 더 시도한다.
 */
const getYarnsPageData = cache(async (): Promise<YarnsPageData | null> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  try {
    const rows = await retryAsync(async () => {
      const result = await queryYarnRows(authUser.id);
      if (result.error) {
        throw result.error;
      }
      return result.data;
    }, [0, 300]);

    return {
      yarns: ((rows ?? []) as YarnRow[]).map((row) => mapYarn(row)),
    };
  } catch (queryError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[실 목록 조회 실패]", queryError);
    }
    throw new Error("실 재고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
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
