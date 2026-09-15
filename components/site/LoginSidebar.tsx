"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import type { GuideCategoryGroup } from "@/lib/knitbook/guides";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoginSidebarProps = {
  groups: GuideCategoryGroup[];
  selectedSlug: string | null;
  onSelectGuide: (slug: string) => void;
  onShowLogin: () => void;
};

/**
 * 로그인 첫 화면 왼쪽에 기초 가이드와 추천 콘텐츠 목록을 보여 준다.
 */
const LoginSidebar = ({
  groups,
  selectedSlug,
  onSelectGuide,
  onShowLogin,
}: LoginSidebarProps) => {
  const isLoginSelected = selectedSlug === null;

  return (
    <aside className="flex flex-col border-b border-border bg-card lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex max-h-72 flex-col lg:sticky lg:top-0 lg:max-h-dvh">
        <div className="border-b border-border px-4 py-4">
          <p className="text-xs font-medium text-primary">KnitBook</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            로그인하지 않아도 읽을 수 있어요
          </p>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4"
          aria-label="뜨개 가이드 목록"
        >
          {groups.map((group) => {
            const isBasics = group.id === "basics";

            return (
              <section key={group.id} className="space-y-2">
                <h2 className="px-1 font-heading text-sm font-semibold text-foreground">
                  {group.title}
                </h2>
                {group.guides.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">
                    아직 준비된 글이 없어요.
                  </p>
                ) : (
                  <ul
                    className={cn(
                      "space-y-0.5",
                      isBasics &&
                        "rounded-xl border border-border bg-background/70 p-1.5"
                    )}
                  >
                    {group.guides.map((guide) => {
                      const isActive = selectedSlug === guide.slug;

                      return (
                        <li key={guide.slug}>
                          <button
                            type="button"
                            onClick={() => onSelectGuide(guide.slug)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "flex w-full rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors",
                              isActive
                                ? "bg-secondary font-medium text-secondary-foreground"
                                : "text-foreground hover:bg-muted/70"
                            )}
                          >
                            {guide.shortTitle}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border px-3 py-3">
          <Button
            type="button"
            variant={isLoginSelected ? "default" : "outline"}
            className="w-full"
            onClick={onShowLogin}
            aria-current={isLoginSelected ? "page" : undefined}
          >
            <LogIn data-icon="inline-start" />
            로그인 화면으로
          </Button>
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            render={<Link href="/guides" />}
          >
            가이드 모두 보기
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default LoginSidebar;
