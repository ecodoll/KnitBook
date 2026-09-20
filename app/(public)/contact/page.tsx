import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import { withPublicCanonical } from "@/lib/knitbook/public-metadata";
import { getContactEmail } from "@/lib/knitbook/site";

export const metadata: Metadata = withPublicCanonical("/contact", {
  title: "문의",
  description:
    "KnitBook 이용, 개인정보, 광고에 관한 문의 방법을 안내합니다.",
});

/**
 * 운영자에게 연락할 수 있는 공개 문의 페이지다.
 */
const ContactPage = () => {
  const contactEmail = getContactEmail();

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          문의하기
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          서비스 이용, 개인정보, 계정, 광고 표시에 관한 질문은 아래 이메일로
          보내 주세요. 영업일 기준 수일 안에 답장을 드리도록 노력합니다.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card px-4 py-4 text-sm leading-7">
        <p className="text-muted-foreground">이메일</p>
        <a
          href={`mailto:${contactEmail}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {contactEmail}
        </a>
      </section>

      <ContactForm contactEmail={contactEmail} />
    </article>
  );
};

export default ContactPage;
