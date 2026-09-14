import type { Metadata } from "next";
import AuthCallbackScreen from "@/app/auth/callback/AuthCallbackScreen";

export const metadata: Metadata = {
  title: "로그인 확인",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 메일 인증·비밀번호 재설정 콜백 페이지 진입점이다.
 */
const AuthCallbackPage = () => {
  return <AuthCallbackScreen />;
};

export default AuthCallbackPage;
