import PageLoading from "@/components/knitbook/shared/PageLoading";

/**
 * 홈·도안 등 앱 화면이 준비되는 동안 뜨개 스피너를 보여준다.
 */
const MainLoading = () => {
  return <PageLoading message="뜨개질 바구니를 여는 중이에요…" />;
};

export default MainLoading;
