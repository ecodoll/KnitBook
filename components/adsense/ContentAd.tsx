import AdUnit from "@/components/adsense/AdUnit";
import {
  canRenderAds,
  getAdSenseClientId,
  getAdSenseSlotId,
} from "@/lib/knitbook/site";

type ContentAdProps = {
  slot: "landing" | "guide";
  className?: string;
};

/**
 * 환경 변수가 있을 때만 콘텐츠 하단 광고를 보여 준다.
 */
const ContentAd = ({ slot, className }: ContentAdProps) => {
  const clientId = getAdSenseClientId();
  const slotId = getAdSenseSlotId(slot);

  if (!canRenderAds() || !clientId || !slotId) {
    return null;
  }

  return <AdUnit clientId={clientId} slotId={slotId} className={className} />;
};

export default ContentAd;
