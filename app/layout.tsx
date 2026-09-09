import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthSync from "@/components/knitbook/auth/AuthSync";
import AdSenseScript from "@/components/adsense/AdSenseScript";
import CookieConsent from "@/components/site/CookieConsent";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  getAdSenseClientId,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/knitbook/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = getSiteUrl();
const adsenseClientId = getAdSenseClientId();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["뜨개", "도안", "작품 기록", "실 재고", "니팅", "KnitBook"],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(adsenseClientId
    ? {
        other: {
          "google-adsense-account": adsenseClientId,
        },
      }
    : {}),
};

/**
 * 앱 전역 레이아웃(폰트·토스트·인증 동기화·광고 스크립트)을 구성한다.
 */
const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Toaster>
          <AuthSync />
          {children}
          <CookieConsent />
        </Toaster>
        <AdSenseScript />
      </body>
    </html>
  );
};

export default RootLayout;
