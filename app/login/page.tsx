import type { Metadata } from "next";
import LoginScreen from "@/app/login/LoginScreen";

export const metadata: Metadata = {
  title: "로그인 | KnitBook",
  description:
    "KnitBook에 로그인하고 도안·작품·실 재고를 한곳에서 관리하세요.",
};

/**
 * 이메일 로그인 페이지 진입점이다.
 */
const LoginPage = () => {
  return <LoginScreen />;
};

export default LoginPage;
