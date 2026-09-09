"use client";

import Link from "next/link";
import { getAllGuides } from "@/lib/knitbook/guides";
import { Button } from "@/components/ui/button";

/**
 * 로그인 화면에서 공개 가이드로 바로 가는 버튼을 보여 준다.
 */
const LoginGuideLinks = () => {
  const guides = getAllGuides();

  return (
    <section className="w-full space-y-3" aria-labelledby="login-guides-heading">
      <div className="space-y-1 text-center">
        <h2
          id="login-guides-heading"
          className="font-heading text-sm font-semibold text-foreground"
        >
          로그인 없이 읽는 뜨개 가이드
        </h2>
        <p className="text-xs leading-5 text-muted-foreground">
          게이지, 실 라벨, 작품 기록처럼 준비에 필요한 글을 먼저 볼 수 있어요.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {guides.map((guide) => (
          <Button
            key={guide.slug}
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href={`/guides/${guide.slug}`} />}
          >
            {guide.shortTitle}
          </Button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link href="/guides" />}
        >
          가이드 모두 보기
        </Button>
      </div>
    </section>
  );
};

export default LoginGuideLinks;
