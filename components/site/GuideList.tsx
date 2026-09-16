import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/knitbook/shared/EmptyState";
import { getGuideHeroFigure } from "@/lib/knitbook/guide-images";
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
      {guides.map((guide) => {
        const hero = getGuideHeroFigure(guide.slug);

        return (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/60"
            >
              {hero ? (
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={hero.src}
                    alt={hero.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 48rem"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="px-4 py-4">
                <p className="text-xs text-muted-foreground">
                  {guide.readingMinutes}분 읽기
                </p>
                <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
                  {guide.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {guide.description}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default GuideList;
