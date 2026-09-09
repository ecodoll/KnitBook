import Link from "next/link";
import KnitBookLogo from "@/components/knitbook/auth/KnitBookLogo";
import { getAuthUser } from "@/lib/knitbook/app-user";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/about", label: "소개" },
  { href: "/guides", label: "가이드" },
  { href: "/contact", label: "문의" },
] as const;

/**
 * 공개 페이지 상단 내비게이션을 렌더한다.
 */
const SiteHeader = async () => {
  let user = null;

  try {
    user = await getAuthUser();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[공개 헤더 사용자 조회 실패]", error);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <KnitBookLogo variant="inline" />

        <nav aria-label="공개 메뉴" className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className={link.href === "/guides" ? undefined : "hidden sm:inline-flex"}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
          {user ? (
            <Button nativeButton={false} size="sm" render={<Link href="/" />}>
              내 기록장
            </Button>
          ) : (
            <Button
              nativeButton={false}
              size="sm"
              render={<Link href="/login" />}
            >
              로그인
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
