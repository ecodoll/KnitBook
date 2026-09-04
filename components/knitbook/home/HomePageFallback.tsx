import HomeSectionHeader from "@/components/knitbook/home/HomeSectionHeader";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Layers, Scissors } from "lucide-react";

/**
 * 홈 대시보드가 준비되는 동안 섹션 골격을 보여 준다.
 */
const HomePageFallback = () => {
  return (
    <div className="space-y-4 pb-2">
      <Skeleton className="h-7 w-48" />
      <section className="space-y-2">
        <HomeSectionHeader id="in-progress-heading" title="진행 중인 작품" icon={Layers} />
        <LoadingState
          variant="tiles"
          rows={4}
          className="grid-cols-4 gap-2 min-[390px]:grid-cols-5"
        />
      </section>
      <section className="space-y-2">
        <HomeSectionHeader id="recent-patterns-heading" title="최근 도안" icon={BookOpen} />
        <LoadingState variant="strip" rows={5} />
      </section>
      <section className="space-y-2">
        <HomeSectionHeader id="yarn-summary-heading" title="내 실" icon={Scissors} />
        <LoadingState rows={1} />
      </section>
    </div>
  );
};

export default HomePageFallback;
