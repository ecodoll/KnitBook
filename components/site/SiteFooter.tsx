import Link from "next/link";
import { getContactEmail, SITE_NAME } from "@/lib/knitbook/site";

const FOOTER_LINKS = [
  { href: "/about", label: "소개" },
  { href: "/guides", label: "뜨개 가이드" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/contact", label: "문의" },
] as const;

/**
 * 공개 페이지와 인증 화면에서 쓰는 정책·문의 푸터를 렌더한다.
 */
const SiteFooter = () => {
  const contactEmail = getContactEmail();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <p className="text-sm font-medium text-foreground">{SITE_NAME}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          뜨개인의 도안·작품·실 기록을 한곳에 모으고, 처음 뜨개를 배우는
          분들을 위한 공개 가이드도 함께 전합니다.
        </p>
        <nav aria-label="정책 및 안내">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs leading-relaxed text-muted-foreground">
          문의:{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          © {year} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
