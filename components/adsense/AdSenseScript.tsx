import Script from "next/script";
import { getAdSenseClientId } from "@/lib/knitbook/site";

/**
 * 공개 페이지에서 Google AdSense 스크립트를 불러온다.
 */
const AdSenseScript = () => {
  const clientId = getAdSenseClientId();

  if (!clientId) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
};

export default AdSenseScript;
