"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Home, Layers, Scissors, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/patterns", label: "도안", icon: BookOpen },
  { href: "/projects", label: "작품", icon: Layers },
  { href: "/yarns", label: "실", icon: Scissors },
  { href: "/ai", label: "AI", icon: Sparkles },
] as const;

/**
 * 모바일 하단 고정 내비게이션을 렌더링한다.
 */
const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      aria-label="주요 메뉴"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
