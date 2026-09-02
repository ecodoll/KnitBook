"use client";

import ErrorState from "@/components/knitbook/shared/ErrorState";

type ProjectDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * 작품 상세를 불러오지 못했을 때 안내한다.
 */
const ProjectDetailError = ({ error, reset }: ProjectDetailErrorProps) => {
  return (
    <ErrorState
      title="작품을 불러오지 못했어요"
      message={
        error.message || "잠시 후 다시 시도해 주세요."
      }
      onRetry={reset}
    />
  );
};

export default ProjectDetailError;
