import type { Metadata } from "next";
import ResetPasswordScreen from "@/app/reset-password/ResetPasswordScreen";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  description: "KnitBook 계정 비밀번호를 새로 정하세요.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 비밀번호 재설정 페이지 진입점이다.
 */
const ResetPasswordPage = () => {
  return <ResetPasswordScreen />;
};

export default ResetPasswordPage;
