import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

/**
 * 없는 주소를 열었을 때 한글 안내와 다음 경로를 보여 준다.
 */
const NotFoundPage = () => {
  return (
    <SiteShell>
      <div className="space-y-4 py-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          주소가 바뀌었거나 삭제된 페이지일 수 있어요. 홈이나 뜨개 가이드에서
          다시 찾아 보세요.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/" />}>
            홈으로
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/guides" />}
          >
            가이드 보기
          </Button>
        </div>
      </div>
    </SiteShell>
  );
};

export default NotFoundPage;
