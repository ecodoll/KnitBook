import PageLoading from "@/components/knitbook/shared/PageLoading";

/**
 * 도안 상세(뷰어) 진입 시 라우트 로딩만 표시한다.
 * 뷰어 내부 스피너와 겹치지 않도록 동일 컴포넌트 하나로 맞춘다.
 */
const PatternDetailLoading = () => {
  return <PageLoading />;
};

export default PatternDetailLoading;
