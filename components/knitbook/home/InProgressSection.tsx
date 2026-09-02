import Link from "next/link";
import type { Project } from "@/components/knitbook/types";
import HomeProjectTile from "@/components/knitbook/home/HomeProjectTile";
import HomeSectionEmpty from "@/components/knitbook/home/HomeSectionEmpty";
import HomeSectionHeader from "@/components/knitbook/home/HomeSectionHeader";
import { HOME_PROJECT_VISIBLE_LIMIT } from "@/components/knitbook/home/constants";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";

type InProgressSectionProps = {
  projects: Project[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onQuickLog?: (projectId: string) => void;
};

/**
 * 홈의 진행 중인 작품을 작은 타일로 한 줄에 보여준다.
 */
const InProgressSection = ({
  projects,
  isLoading,
  errorMessage,
  onRetry,
  onQuickLog,
}: InProgressSectionProps) => {
  const visibleProjects = projects.slice(0, HOME_PROJECT_VISIBLE_LIMIT);
  const hasMore = projects.length > HOME_PROJECT_VISIBLE_LIMIT;

  return (
    <section className="space-y-2" aria-labelledby="in-progress-heading">
      <HomeSectionHeader id="in-progress-heading" title="진행 중인 작품" icon={Layers}>
        <Button
          variant="ghost"
          size="icon-xs"
          nativeButton={false}
          render={<Link href="/projects/new" />}
          aria-label="새 작품"
        >
          <Plus />
        </Button>
        {hasMore ? (
          <Button
            variant="ghost"
            size="xs"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            전체
          </Button>
        ) : null}
      </HomeSectionHeader>

      {isLoading ? <LoadingState variant="tiles" rows={3} /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : null}

      {!isLoading && !errorMessage && projects.length === 0 ? (
        <HomeSectionEmpty
          message="진행 중인 작품이 없어요"
          actionLabel="만들기"
          actionHref="/projects/new"
        />
      ) : null}

      {!isLoading && !errorMessage && visibleProjects.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2.5">
          {visibleProjects.map((project) => (
            <li key={project.id}>
              <HomeProjectTile project={project} onQuickLog={onQuickLog} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default InProgressSection;
