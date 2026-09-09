import type { Metadata } from "next";
import LandingPage from "@/components/site/LandingPage";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/knitbook/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — 뜨개인을 위한 도안·작품·실 기록장`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: getSiteUrl(),
  },
};

/**
 * 비로그인 홈으로 다시 쓰는 랜딩 본문이다.
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
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: siteUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: "ko-KR",
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
        },
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
