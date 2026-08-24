import PageLoading from "@/components/knitbook/shared/PageLoading";

/**
 * 회원가입 화면이 준비되는 동안 뜨개 스피너를 보여준다.
 */
const SignupLoading = () => {
  return <PageLoading fullScreen message="가입 화면을 여는 중이에요…" />;
};

export default SignupLoading;
