import LoadingState from "@/components/knitbook/shared/LoadingState";

/**
 * 실 목록이 준비되는 동안 격자 스켈레톤을 보여 준다.
 */
const YarnsPageFallback = () => {
  return <LoadingState variant="grid" rows={6} className="-mx-4" />;
};

export default YarnsPageFallback;
