import type { Metadata } from "next";
import Link from "next/link";
import LegalArticle from "@/components/site/LegalArticle";
import { withPublicCanonical } from "@/lib/knitbook/public-metadata";
import { getContactEmail, SITE_NAME } from "@/lib/knitbook/site";

export const metadata: Metadata = withPublicCanonical("/privacy", {
  title: "개인정보처리방침",
  description:
    "KnitBook이 수집하는 개인정보, 보관 기간, Google 광고 쿠키, 이용자 권리를 안내합니다.",
  robots: {
    index: true,
    follow: true,
  },
});

/**
 * 개인정보 보호법과 애드센스 심사에 필요한 처리 방침을 공개한다.
 */
const PrivacyPage = () => {
  const contactEmail = getContactEmail();

  return (
    <LegalArticle title="개인정보처리방침" updatedAt="2026-09-09">
      <section className="space-y-3">
        <h2>1. 수집하는 개인정보</h2>
        <p>
          {SITE_NAME}(이하 &quot;서비스&quot;)는 회원 가입과 서비스 제공에
          필요한 최소한의 정보만 수집합니다.
        </p>
        <ul>
          <li>필수: 이메일 주소, 비밀번호(암호화 저장), 닉네임</li>
          <li>
            이용자가 직접 올리는 내용: 도안 파일, 작품·실 사진, 메모, 재고
            정보
          </li>
          <li>
            자동 수집: 접속 기록, 브라우저 종류, 쿠키, 광고 식별을 위한 기기
            정보
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>2. 이용 목적</h2>
        <ul>
          <li>회원 인증, 계정 보호, 고객 문의 응대</li>
          <li>도안·작품·실 기록의 저장과 조회</li>
          <li>서비스 개선, 오류 확인, 부정 이용 방지</li>
          <li>Google AdSense를 통한 광고 게재 및 광고 성과 측정</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. 보유 기간</h2>
        <p>
          회원 정보는 회원 탈퇴 시 지체 없이 삭제합니다. 관계 법령에 따라 보관이
          필요한 기록은 해당 기간 동안만 보관합니다. 이용자가 업로드한 파일은
          계정 삭제와 함께 삭제됩니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. 제3자 제공과 처리 위탁</h2>
        <p>
          서비스는 운영에 필요한 범위에서 아래 사업자에게 처리를 위탁하거나
          광고를 위해 정보를 제공할 수 있습니다.
        </p>
        <ul>
          <li>Supabase: 회원 인증, 데이터베이스, 파일 저장</li>
          <li>Google AdSense: 광고 게재, 부정 클릭 방지, 광고 맞춤 설정</li>
          <li>호스팅 제공자: 웹사이트 전송과 보안</li>
        </ul>
        <p>
          법령에 따른 요청이 있는 경우를 제외하고, 이용자 동의 없이 개인정보를
          판매하거나 마케팅 목적으로 제3자에게 제공하지 않습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. 쿠키와 Google 광고</h2>
        <p>
          서비스는 로그인 유지, 방문 통계, 광고 안내에 쿠키를 사용할 수
          있습니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 이 경우 로그인
          등 일부 기능이 제한될 수 있습니다.
        </p>
        <p>
          제3자 광고 제공업체인 Google은 이 사이트에 광고를 게재하기 위해
          쿠키를 사용합니다. Google의 쿠키 사용을 통해 Google과 파트너는
          이용자의 사이트 방문 기록을 바탕으로 광고를 게재할 수 있습니다.
          이용자는{" "}
          <a
            href="https://www.google.com/settings/ads"
            className="text-foreground underline-offset-4 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            Google 광고 설정
          </a>
          에서 맞춤 광고를 선택 해제할 수 있습니다. Google의 광고 쿠키에 대한
          자세한 내용은{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            className="text-foreground underline-offset-4 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            Google 광고 기술 정책
          </a>
          을 참고하세요.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수
          있습니다. 회원 정보 수정은 서비스 안에서 할 수 있으며, 삭제를 원할
          경우 아래 연락처로 요청해 주세요. 만 14세 미만의 아동은 서비스를
          이용할 수 없습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. 개인정보 보호책임자</h2>
        <p>
          개인정보 관련 문의는 KnitBook 운영팀({contactEmail})으로 보내 주세요.
          문의 페이지는{" "}
          <Link
            href="/contact"
            className="text-foreground underline-offset-4 hover:underline"
          >
            문의하기
          </Link>
          입니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. 방침의 변경</h2>
        <p>
          이 방침을 변경하는 경우 서비스 공지 또는 이 페이지의 시행일을 바꿔
          알립니다.
        </p>
      </section>
    </LegalArticle>
  );
};

export default PrivacyPage;
