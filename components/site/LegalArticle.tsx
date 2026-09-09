import type { ReactNode } from "react";

type LegalArticleProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

/**
 * 약관·개인정보 문서의 공통 제목과 본문 타이포를 맞춘다.
 */
const LegalArticle = ({ title, updatedAt, children }: LegalArticleProps) => {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">시행일 {updatedAt}</p>
      </header>
      <div className="space-y-8 text-sm leading-7 text-foreground [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-muted-foreground">
        {children}
      </div>
    </article>
  );
};

export default LegalArticle;
