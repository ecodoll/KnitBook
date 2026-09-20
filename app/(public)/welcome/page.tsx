import type { Metadata } from "next";
import LandingPage from "@/components/site/LandingPage";
import { getAllGuides } from "@/lib/knitbook/guides";
import { LANDING_FAQS, LANDING_META_DESCRIPTION } from "@/lib/knitbook/landing-content";
import { withPublicCanonical } from "@/lib/knitbook/public-metadata";
import { getSiteUrl, SITE_NAME } from "@/lib/knitbook/site";

export const metadata: Metadata = withPublicCanonical("/", {
  title: {
    absolute: `${SITE_NAME} — 뜨개인을 위한 도안·작품·실 기록장`,
  },
  description: LANDING_META_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — 뜨개인을 위한 도안·작품·실 기록장`,
    description: LANDING_META_DESCRIPTION,
    type: "website",
  },
});

/**
 * 비로그인 홈 본문이다. 미들웨어가 / 요청을 이 경로로 내부 연결한다.
 */
const WelcomePage = () => {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl,
        inLanguage: "ko-KR",
        description: LANDING_META_DESCRIPTION,
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: siteUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: "ko-KR",
        description: LANDING_META_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: LANDING_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "ItemList",
        name: "KnitBook 뜨개 가이드",
        itemListElement: getAllGuides().map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/guides/${guide.slug}`,
          name: guide.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
};

export default WelcomePage;
