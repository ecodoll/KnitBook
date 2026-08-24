import PageLoading from "@/components/knitbook/shared/PageLoading";

/**
 * 루트 구간이 준비되는 동안 뜨개 스피너를 보여준다.
 */
const RootLoading = () => {
  return <PageLoading fullScreen message="KnitBook을 여는 중이에요…" />;
};

export default RootLoading;
