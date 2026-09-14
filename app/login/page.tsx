import type { Metadata } from "next";
import LoginScreen from "@/app/login/LoginScreen";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "KnitBook에 로그인하고 도안·작품·실 재고를 한곳에서 관리하세요.",
  robots: {
    index: false,
    follow: true,
  },
};

type LoginPageProps = {
  searchParams: Promise<{ reset?: string | string[] }>;
};

/**
 * 재설정 실패 쿼리가 있는지 판별한다.
 */
const hasResetFailed = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.includes("failed");
  }

  return value === "failed";
};

/**
 * 이메일 로그인 페이지 진입점이다.
 */
const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = await searchParams;

  return <LoginScreen resetFailed={hasResetFailed(params.reset)} />;
};

export default LoginPage;
