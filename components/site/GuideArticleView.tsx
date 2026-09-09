import Link from "next/link";
import ContentAd from "@/components/adsense/ContentAd";
import type { GuideArticle } from "@/lib/knitbook/guides";

type GuideArticleViewProps = {
  guide: GuideArticle;
};

/**
 * 공개 가이드 원문과 하단 광고 영역을 렌더한다.
 */
const GuideArticleView = ({ guide }: GuideArticleViewProps) => {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">
          <Link href="/guides" className="underline-offset-4 hover:underline">
            뜨개 가이드
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          {guide.readingMinutes}분 읽기
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {guide.title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {guide.description}
        </p>
        <p className="text-xs text-muted-foreground">
          발행 {guide.publishedAt}
          {guide.updatedAt !== guide.publishedAt
            ? ` · 수정 ${guide.updatedAt}`
            : null}
        </p>
      </header>

      <div className="space-y-8">
        {guide.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-7 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <ContentAd slot="guide" className="py-2" />
    </article>
  );
};

export default GuideArticleView;
