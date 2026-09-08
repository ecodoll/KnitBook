import { createBrowserClient } from "@supabase/ssr";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserSupabaseClient | undefined;

/**
 * 클라이언트 컴포넌트용 Supabase 브라우저 클라이언트를 반환한다.
 * 여러 번 만들면 세션 초기화가 경쟁해 첫 조회가 실패할 수 있어 한 인스턴스만 쓴다.
 */
const createClient = () => {
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
};

export { createClient };
