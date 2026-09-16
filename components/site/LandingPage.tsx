import Image from "next/image";
import Link from "next/link";
import { BookOpen, Layers, NotebookPen, Scissors } from "lucide-react";
import ContentAd from "@/components/adsense/ContentAd";
import LandingHeroVisual from "@/components/site/LandingHeroVisual";
import { getGuideHeroFigure } from "@/lib/knitbook/guide-images";
import { getAllGuides, getFeaturedGuides } from "@/lib/knitbook/guides";
import {
  LANDING_AUDIENCE,
  LANDING_FAQS,
  LANDING_HERO_EYEBROW,
  LANDING_HERO_LEAD,
  LANDING_HERO_TITLE,
  LANDING_PROBLEM_PARAGRAPHS,
  LANDING_STEPS,
} from "@/lib/knitbook/landing-content";
import { SITE_NAME } from "@/lib/knitbook/site";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    title: "도안을 한곳에",
    description:
      "메일함과 다운로드 폴더에 흩어진 PDF를 작품과 연결해 보관합니다. 지금 뜨는 도안만 바로 열어 볼 수 있습니다.",
    icon: BookOpen,
  },
  {
    title: "작품 진행을 기억",
    description:
      "단수, 사용한 실, 바늘, 도안과 다르게 처리한 부분을 남겨 두면 며칠 쉬어도 이어서 뜰 수 있습니다.",
    icon: Layers,
  },
  {
    title: "실 재고를 숫자로",
    description:
      "브랜드, 색, LOT, 남은 양을 기록해 같은 실을 중복으로 사거나 잔실을 잊는 일을 줄입니다.",
    icon: Scissors,
  },
  {
    title: "기록이 다음 작품을 돕습니다",
    description:
      "도안·작품·실이 연결되면 ‘이 남은 실로 무엇을 뜰지’를 고르기가 쉬워집니다.",
    icon: NotebookPen,
  },
] as const;

/**
 * 비로그인 홈(랜딩)에 서비스 소개와 공개 가이드를 보여 준다.
 */
const LandingPage = () => {
  const featuredGuides = getFeaturedGuides();
  const featuredSlugs = new Set(featuredGuides.map((guide) => guide.slug));
  const moreGuides = getAllGuides().filter(
    (guide) => !featuredSlugs.has(guide.slug)
  );

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 sm:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
        <div className="space-y-5">
          <p className="text-sm font-medium text-primary">{LANDING_HERO_EYEBROW}</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {LANDING_HERO_TITLE}
          </h1>
          <div className="space-y-3 text-base leading-7 text-muted-foreground">
            {LANDING_HERO_LEAD.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button nativeButton={false} render={<Link href="/guides" />}>
              뜨개 가이드 읽기
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/signup" />}
            >
              무료로 시작하기
            </Button>
          </div>
        </div>
        <LandingHeroVisual />
      </section>

      <section className="space-y-4" aria-labelledby="guide-heading">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="guide-heading"
              className="font-heading text-xl font-semibold text-foreground"
            >
              지금 바로 읽는 뜨개 가이드
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              계정 없이 원문 전체를 볼 수 있습니다. 도구를 사기 전, 또는 작품을
              다시 집기 전에 열어 보세요.
            </p>
          </div>
          <Link
            href="/guides"
            className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            모두 보기
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {featuredGuides.map((guide) => {
            const hero = getGuideHeroFigure(guide.slug);

            return (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/60"
                >
                  {hero ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={hero.src}
                        alt={hero.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 24rem"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="px-4 py-4">
                    <p className="text-xs font-medium text-primary">
                      {guide.shortTitle}
                      <span className="mx-1.5 text-muted-foreground" aria-hidden>
                        ·
                      </span>
                      <span className="font-normal text-muted-foreground">
                        {guide.readingMinutes}분 읽기
                      </span>
                    </p>
                    <p className="mt-2 font-heading text-base font-semibold leading-6 text-foreground">
                      {guide.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {guide.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {moreGuides.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">이어서 읽기</p>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {moreGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="flex items-baseline justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {guide.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {guide.readingMinutes}분
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-4" aria-labelledby="problem-heading">
        <h2
          id="problem-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          뜨개 기록이 흩어지면 생기는 일
        </h2>
        <div className="space-y-3 text-sm leading-7 text-muted-foreground">
          {LANDING_PROBLEM_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="steps-heading">
        <h2
          id="steps-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          이렇게 시작하면 됩니다
        </h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {LANDING_STEPS.map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-border bg-card px-4 py-4"
            >
              <p className="text-xs font-medium text-primary">
                {item.step}단계
              </p>
              <p className="mt-2 font-heading text-base font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4" aria-labelledby="feature-heading">
        <h2
          id="feature-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          {SITE_NAME}에서 할 수 있는 일
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4" aria-labelledby="audience-heading">
        <h2
          id="audience-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          이런 분께 맞습니다
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          {LANDING_AUDIENCE.forYou.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm font-medium text-foreground">이런 용도는 아닙니다</p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          {LANDING_AUDIENCE.notForYou.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4" aria-labelledby="privacy-heading">
        <h2
          id="privacy-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          올린 도안은 나만 봅니다
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          사용자가 업로드한 PDF와 작품 사진, 실 재고는 다른 회원에게 공개되지
          않습니다. 구매한 상용 도안은 개인 보관 영역으로 다루며, KnitBook이
          도안을 재판매하거나 공유하지 않습니다. 수집하는 정보와 광고에 쓰는
          쿠키는{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            개인정보처리방침
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          {LANDING_FAQS.map((faq) => (
            <article
              key={faq.question}
              className="rounded-xl border border-border bg-card px-4 py-4"
            >
              <h3 className="font-heading text-base font-semibold text-foreground">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <ContentAd slot="landing" className="py-2" />

      <section className="rounded-2xl bg-secondary/70 px-5 py-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          기록을 시작하려면
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          이메일만으로 가입할 수 있습니다. 가이드는 가입 전에도 읽을 수 있고,
          개인 기록장은 가입 후에 열립니다. 서비스 이용 전{" "}
          <Link href="/terms" className="underline-offset-4 hover:underline">
            이용약관
          </Link>
          과 개인정보처리방침을 꼭 읽어 주세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/signup" />}>
            회원가입
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/login" />}
          >
            로그인
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
