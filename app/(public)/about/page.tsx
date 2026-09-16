import type { Metadata } from "next";
import Link from "next/link";
import { getContactEmail, SITE_NAME } from "@/lib/knitbook/site";

export const metadata: Metadata = {
  title: "소개",
  description:
    "KnitBook은 뜨개인의 도안·작품·실 기록을 한곳에 모으는 웹 서비스입니다. 운영 목적과 연락처를 안내합니다.",
};

/**
 * 서비스 소개와 운영 주체를 공개한다.
 */
const AboutPage = () => {
  const contactEmail = getContactEmail();

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          KnitBook 소개
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {SITE_NAME}은 뜨개질을 즐기는 사람이 도안, 작품, 실 재고를 개인
          공간에서 이어서 관리하도록 돕는 웹 서비스입니다.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">왜 만들었나요</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          뜨개 기록은 원래 한곳에 있지 않습니다. 산 도안은 메일함에, 단수는
          종이 쪽지에, 실은 상자 안에 있습니다. 며칠 쉬고 돌아오면 어디까지
          떴는지보다 ‘무엇을 어떤 실로 떴는지’를 먼저 찾게 됩니다. KnitBook은 이
          찾기를 줄이기 위해 세 가지 정보를 연결합니다.
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          커뮤니티나 도안 판매가 아니라, 내가 가진 자료를 안전하게 보관하는
          개인 기록장이 먼저입니다. 홈과 가이드 목록의 공개 글은 서비스를 처음
          만나는 분과 검색·광고 심사를 위해 로그인 없이 읽을 수 있도록 열어
          두었습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">운영 정보</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-muted-foreground">
          <li>서비스명: {SITE_NAME}</li>
          <li>운영 형태: 개인이 운영하는 웹 서비스</li>
          <li>
            연락처:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {contactEmail}
            </a>
          </li>
          <li>
            문의 페이지:{" "}
            <Link
              href="/contact"
              className="text-foreground underline-offset-4 hover:underline"
            >
              /contact
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">광고와 정책</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          공개 가이드와 소개 페이지에는 Google AdSense 광고가 표시될 수
          있습니다. 로그인·회원가입·개인정보처리방침·이용약관 페이지에는 광고를
          넣지 않습니다. 수집 항목과 쿠키 사용은{" "}
          <Link
            href="/privacy"
            className="text-foreground underline-offset-4 hover:underline"
          >
            개인정보처리방침
          </Link>
          을, 서비스 이용 조건은{" "}
          <Link
            href="/terms"
            className="text-foreground underline-offset-4 hover:underline"
          >
            이용약관
          </Link>
          을 따릅니다.
        </p>
      </section>
    </article>
  );
};

export default AboutPage;
