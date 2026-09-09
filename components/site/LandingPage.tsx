import Link from "next/link";
import { BookOpen, Layers, Scissors, NotebookPen } from "lucide-react";
import ContentAd from "@/components/adsense/ContentAd";
import { getAllGuides } from "@/lib/knitbook/guides";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/knitbook/site";
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
  const guides = getAllGuides();

  return (
    <div className="space-y-14">
      <section className="space-y-5">
        <p className="text-sm font-medium text-primary">{SITE_NAME}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {SITE_TAGLINE}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {SITE_DESCRIPTION} 로그인하지 않아도 뜨개 준비와 기록에 대한 가이드를
          읽을 수 있고, 가입하면 나의 도안과 작품을 비공개로 관리할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/signup" />}>
            무료로 시작하기
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/guides" />}
          >
            뜨개 가이드 읽기
          </Button>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="problem-heading">
        <h2
          id="problem-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          뜨개 기록이 흩어지면 생기는 일
        </h2>
        <div className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            유료 도안은 이메일 링크에 남아 있고, 진행 중인 단수는 메모장이나
            사진 앱에 있습니다. 실 라벨은 타래에서 떨어져 나가고, 같은 색을 이미
            사 놓고도 다시 장바구니에 담게 됩니다. 며칠 쉬고 돌아오면 소매를
            어디서 줄였는지 기억나지 않아 도안을 처음부터 다시 읽게 됩니다.
          </p>
          <p>
            KnitBook은 이 세 가지—도안, 작품, 실—를 한 서비스 안에 모아 두는
            것을 목표로 합니다. 화려한 커뮤니티보다, 내가 지금 뜨고 있는 작업을
            안전하게 이어 갈 수 있는 개인 기록장을 우선합니다.
          </p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="feature-heading">
        <h2
          id="feature-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          KnitBook에서 할 수 있는 일
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

      <section className="space-y-4" aria-labelledby="guide-heading">
        <div className="flex items-end justify-between gap-3">
          <h2
            id="guide-heading"
            className="font-heading text-xl font-semibold text-foreground"
          >
            뜨개 가이드
          </h2>
          <Link
            href="/guides"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            모두 보기
          </Link>
        </div>
        <ul className="space-y-3">
          {guides.slice(0, 4).map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <p className="font-medium text-foreground">{guide.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {guide.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ContentAd slot="landing" className="py-2" />

      <section className="rounded-2xl bg-secondary/70 px-5 py-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          기록을 시작하려면
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          이메일만으로 가입할 수 있습니다. 서비스 이용 전{" "}
          <Link href="/terms" className="underline-offset-4 hover:underline">
            이용약관
          </Link>
          과 개인정보처리방침을 꼭 읽어 주세요.
        </p>
        <div className="mt-4">
          <Button nativeButton={false} render={<Link href="/signup" />}>
            회원가입
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
