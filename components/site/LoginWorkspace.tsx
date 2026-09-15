"use client";

import { useEffect, useState } from "react";
import LoginScreen from "@/app/login/LoginScreen";
import LoginGuidePanel from "@/components/site/LoginGuidePanel";
import LoginSidebar from "@/components/site/LoginSidebar";
import SiteFooter from "@/components/site/SiteFooter";
import type { GuideCategoryGroup } from "@/lib/knitbook/guides";

type LoginWorkspaceProps = {
  groups: GuideCategoryGroup[];
  initialSlug: string | null;
  resetFailed?: boolean;
};

/**
 * 주소의 guide 값에 맞춰 로그인 경로를 갱신한다.
 */
const replaceLoginUrl = (slug: string | null) => {
  const nextUrl = slug
    ? `/login?guide=${encodeURIComponent(slug)}`
    : "/login";

  window.history.replaceState(null, "", nextUrl);
};

/**
 * 로그인 첫 화면의 왼쪽 목록과 오른쪽 로그인·가이드 영역을 구성한다.
 */
const LoginWorkspace = ({
  groups,
  initialSlug,
  resetFailed = false,
}: LoginWorkspaceProps) => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug);
  const selectedGuide =
    groups
      .flatMap((group) => group.guides)
      .find((guide) => guide.slug === selectedSlug) ?? null;

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    const isCompactViewport = window.matchMedia("(max-width: 1023px)").matches;
    if (!isCompactViewport) {
      return;
    }

    document.getElementById("login-main")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedSlug]);

  /**
   * 오른쪽 영역에 가이드 본문을 연다.
   */
  const handleSelectGuide = (slug: string) => {
    setSelectedSlug(slug);
    replaceLoginUrl(slug);
  };

  /**
   * 오른쪽 영역을 로그인 화면으로 되돌린다.
   */
  const handleShowLogin = () => {
    setSelectedSlug(null);
    replaceLoginUrl(null);
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.935_0.012_152)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.945_0.025_8)_0%,_transparent_40%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        <div className="flex min-h-[min(44rem,calc(100dvh-8rem))] flex-1 flex-col overflow-hidden rounded-2xl bg-card shadow-xs ring-1 ring-foreground/10 lg:flex-row">
          <LoginSidebar
            groups={groups}
            selectedSlug={selectedGuide ? selectedSlug : null}
            onSelectGuide={handleSelectGuide}
            onShowLogin={handleShowLogin}
          />

          <section
            id="login-main"
            className="flex min-h-[24rem] min-w-0 flex-1 flex-col overflow-y-auto bg-background"
            aria-live="polite"
            aria-label={selectedGuide ? selectedGuide.title : "로그인"}
          >
            {selectedGuide ? (
              <LoginGuidePanel
                guide={selectedGuide}
                onShowLogin={handleShowLogin}
              />
            ) : (
              <LoginScreen resetFailed={resetFailed} />
            )}
          </section>
        </div>
      </div>

      <div className="relative z-10">
        <SiteFooter wide />
      </div>
    </div>
  );
};

export default LoginWorkspace;
