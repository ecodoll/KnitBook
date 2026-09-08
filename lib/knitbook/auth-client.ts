"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const AUTH_WAIT_MS = 1500;

/**
 * 지정한 시간만큼 기다린다.
 */
const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * 브라우저 세션에서 로그인 사용자를 읽는다.
 */
const readSessionUser = async (supabase: ReturnType<typeof createClient>) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
};

/**
 * 세션 이벤트가 올 때까지 기다린다. 이미 초기화가 끝난 경우도 놓치지 않는다.
 */
const waitForSessionUser = async (supabase: ReturnType<typeof createClient>) => {
  const alreadyReady = await readSessionUser(supabase);
  if (alreadyReady) {
    return alreadyReady;
  }

  return new Promise<User | null>((resolve) => {
    let settled = false;
    let timeoutId = 0;
    let unsubscribe = () => {};

    const finish = (user: User | null) => {
      if (settled) {
        return;
      }
      settled = true;
      unsubscribe();
      window.clearTimeout(timeoutId);
      resolve(user);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (session?.user) {
        finish(session.user);
      }
    });
    unsubscribe = () => {
      subscription.unsubscribe();
    };

    timeoutId = window.setTimeout(() => {
      finish(null);
    }, AUTH_WAIT_MS);

    void readSessionUser(supabase).then((user) => {
      if (user) {
        finish(user);
      }
    });
  });
};

/**
 * 브라우저 세션이 준비된 뒤 로그인 사용자 ID를 반환한다.
 * 앱을 막 열었을 때 쿠키 세션 초기화 레이스를 기다린다.
 */
const requireBrowserUser = async () => {
  const supabase = createClient();

  let user = await waitForSessionUser(supabase);

  if (!user) {
    await sleep(200);
    user = await readSessionUser(supabase);
  }

  if (!user) {
    const {
      data: { user: fetched },
      error,
    } = await supabase.auth.getUser();

    if (error || !fetched) {
      throw new Error("로그인이 필요해요. 다시 로그인해 주세요.");
    }

    return { supabase, userId: fetched.id };
  }

  return { supabase, userId: user.id };
};

export { requireBrowserUser };
