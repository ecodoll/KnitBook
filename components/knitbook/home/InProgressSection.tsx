import Link from "next/link";
import type { Project } from "@/components/knitbook/types";
import ProjectCard from "@/components/knitbook/projects/ProjectCard";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import LoadingState from "@/components/knitbook/shared/LoadingState";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type InProgressSectionProps = {
  projects: Project[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onQuickLog?: (projectId: string) => void;
};

/**
 * 홈의 진행 중인 작품 섹션을 렌더링한다.
 */
const InProgressSection = ({
  projects,
  isLoading,
  errorMessage,
  onRetry,
  onQuickLog,
}: InProgressSectionProps) => {
  return (
    <section className="space-y-3" aria-labelledby="in-progress-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="in-progress-heading" className="text-base font-medium">
          진행 중인 작품
        </h2>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/projects/new" />}
        >
          <Plus data-icon="inline-start" />
          새 작품
        </Button>
      </div>

      {isLoading ? <LoadingState rows={2} /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : null}

      {!isLoading && !errorMessage && projects.length === 0 ? (
        <EmptyState
          title="진행 중인 작품이 없어요"
          description="도안을 고르고 새 작품을 시작해 보세요."
          actionLabel="작품 만들기"
          actionHref="/projects/new"
        />
      ) : null}

      {!isLoading && !errorMessage && projects.length > 0 ? (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} onQuickLog={onQuickLog} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default InProgressSection;
