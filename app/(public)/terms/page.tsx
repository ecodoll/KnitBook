import type { Metadata } from "next";
import Link from "next/link";
import LegalArticle from "@/components/site/LegalArticle";
import { withPublicCanonical } from "@/lib/knitbook/public-metadata";
import { getContactEmail, SITE_NAME } from "@/lib/knitbook/site";

export const metadata: Metadata = withPublicCanonical("/terms", {
  title: "이용약관",
  description:
    "KnitBook 웹 서비스 이용 조건, 금지 행위, 게시 콘텐츠와 책임 범위를 안내합니다.",
});

/**
 * 서비스 이용 조건을 공개한다.
 */
const TermsPage = () => {
  const contactEmail = getContactEmail();

  return (
    <LegalArticle title="이용약관" updatedAt="2026-09-09">
      <section className="space-y-3">
        <h2>1. 목적</h2>
        <p>
          이 약관은 {SITE_NAME} 웹 서비스(이하 &quot;서비스&quot;)의 이용
          조건과 운영자와 이용자의 권리를 정합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. 서비스의 내용</h2>
        <p>
          서비스는 뜨개 도안, 작품 진행, 실 재고를 개인이 기록·조회하도록
          돕습니다. 공개 가이드와 소개 페이지는 로그인 없이 이용할 수 있고,
          개인 기록 기능은 회원 가입 후 이용할 수 있습니다. 운영자는 기능을
          개선하거나 일부를 변경할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>3. 계정</h2>
        <ul>
          <li>만 14세 이상만 가입할 수 있습니다.</li>
          <li>이메일과 비밀번호 관리 책임은 이용자에게 있습니다.</li>
          <li>다른 사람의 계정을 사용하거나 허위 정보로 가입해서는 안 됩니다.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. 이용자가 올리는 자료</h2>
        <p>
          이용자가 업로드한 도안 파일, 사진, 메모의 권리는 이용자 또는 원래
          권리자에게 있습니다. 구매한 상용 도안은 개인 사용 범위에서만
          보관해야 하며, 다른 이용자에게 공유하거나 재판매해서는 안 됩니다.
          운영자는 이용자 도안을 판매하거나 공개하지 않습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. 금지 행위</h2>
        <ul>
          <li>법령 또는 타인의 권리를 침해하는 자료 업로드</li>
          <li>서비스 장애를 일으키는 자동화 접근, 부정 클릭, 광고 방해</li>
          <li>음란·혐오·폭력 등 다른 이용자에게 해를 끼치는 행위</li>
          <li>운영자를 사칭하거나 서비스 정보를 무단으로 수집하는 행위</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>6. 광고</h2>
        <p>
          공개 페이지에는 Google AdSense 등 제3자 광고가 표시될 수 있습니다.
          광고의 내용과 연결된 거래는 해당 광고주와 이용자 사이의 문제입니다.
          광고와 쿠키에 관한 안내는{" "}
          <Link
            href="/privacy"
            className="text-foreground underline-offset-4 hover:underline"
          >
            개인정보처리방침
          </Link>
          을 따릅니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. 책임의 한계</h2>
        <p>
          서비스는 현재 상태 그대로 제공됩니다. 이용자가 보관한 도안·기록의
          백업 책임은 이용자에게 있으며, 무료 서비스 특성상 일시적인 장애나
          데이터 손실에 대해 법령이 허용하는 범위에서 책임을 제한합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. 계약 해지</h2>
        <p>
          이용자는 언제든지 계정 삭제를 요청할 수 있습니다. 운영자는 이 약관을
          위반한 계정을 제한하거나 삭제할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>9. 문의</h2>
        <p>
          약관에 대한 문의는 {contactEmail} 또는{" "}
          <Link
            href="/contact"
            className="text-foreground underline-offset-4 hover:underline"
          >
            문의 페이지
          </Link>
          로 보내 주세요.
        </p>
      </section>
    </LegalArticle>
  );
};

export default TermsPage;
