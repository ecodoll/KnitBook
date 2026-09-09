import { getAdSensePublisherId } from "@/lib/knitbook/site";

/**
 * 게시자 ID가 있을 때만 ads.txt를 내려 준다.
 */
export const GET = () => {
  const publisherId = getAdSensePublisherId();

  if (!publisherId) {
    return new Response("Ads.txt is not configured.\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
