import type { Metadata } from "next";
import SignupScreen from "@/app/signup/SignupScreen";

export const metadata: Metadata = {
  title: "회원가입 | KnitBook",
  description:
    "이메일과 비밀번호로 KnitBook에 가입하고 도안·작품·실을 한곳에서 관리하세요.",
};

/**
 * 이메일 회원가입 페이지 진입점이다.
 */
const SignupPage = () => {
  return <SignupScreen />;
};

export default SignupPage;
