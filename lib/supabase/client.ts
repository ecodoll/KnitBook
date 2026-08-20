import { createBrowserClient } from "@supabase/ssr";

/**
 * 클라이언트 컴포넌트용 Supabase 브라우저 클라이언트를 생성한다.
 */
const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export { createClient };
