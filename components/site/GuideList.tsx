import Link from "next/link";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import { getAllGuides } from "@/lib/knitbook/guides";

/**
 * 공개 가이드 글 목록을 렌더한다.
 */
const GuideList = () => {
  const guides = getAllGuides();

  if (guides.length === 0) {
    return (
      <EmptyState
        title="아직 공개된 가이드가 없어요"
        description="뜨개 준비와 기록에 도움이 되는 글을 준비하고 있어요."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {guides.map((guide) => (
        <li key={guide.slug}>
          <Link
            href={`/guides/${guide.slug}`}
            className="block rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:bg-muted/60"
          >
            <p className="text-xs text-muted-foreground">
              {guide.readingMinutes}분 읽기
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {guide.description}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default GuideList;
