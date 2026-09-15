"use client";

import Link from "next/link";
import type { GuideArticle } from "@/lib/knitbook/guides";
import { Button } from "@/components/ui/button";

type LoginGuidePanelProps = {
  guide: GuideArticle;
  onShowLogin: () => void;
};

/**
 * 로그인 첫 화면 오른쪽에 선택한 가이드 본문을 보여 준다.
 */
const LoginGuidePanel = ({ guide, onShowLogin }: LoginGuidePanelProps) => {
  return (
    <article className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {guide.readingMinutes}분 읽기
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onShowLogin}>
          로그인 화면으로
        </Button>
      </div>

      <header className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {guide.title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {guide.description}
        </p>
      </header>

      <div className="space-y-8">
        {guide.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
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

      <p className="text-sm text-muted-foreground">
        이 글을 따로 열어 보려면{" "}
        <Link
          href={`/guides/${guide.slug}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          가이드 페이지
        </Link>
        로 이동해 주세요.
      </p>
    </article>
  );
};

export default LoginGuidePanel;
