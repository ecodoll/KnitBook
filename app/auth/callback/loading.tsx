import PageLoading from "@/components/knitbook/shared/PageLoading";

/**
 * 인증 콜백이 준비되는 동안 뜨개 스피너를 보여준다.
 */
const AuthCallbackLoading = () => {
  return <PageLoading fullScreen />;
};

export default AuthCallbackLoading;
