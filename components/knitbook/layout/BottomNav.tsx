"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookOpen, Home, Layers, Scissors, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/patterns", label: "도안", icon: BookOpen },
  { href: "/projects", label: "작품", icon: Layers },
  { href: "/yarns", label: "실", icon: Scissors },
  { href: "/ai", label: "AI", icon: Sparkles },
] as const;

type BottomNavItemInnerProps = {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
};

/**
 * 탭이 활성화됐거나 이동 중이면 강조한다.
 */
const BottomNavItemInner = ({
  label,
  icon: Icon,
  isActive,
}: BottomNavItemInnerProps) => {
  const { pending } = useLinkStatus();
  const highlight = isActive || pending;

  return (
    <span
      className={cn(
        "flex h-full flex-col items-center justify-center gap-0.5 text-xs transition-colors",
        highlight
          ? "text-primary font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-5" aria-hidden />
      <span>{label}</span>
    </span>
  );
};

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
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                className="flex h-full w-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
              >
                <BottomNavItemInner
                  label={label}
                  icon={icon}
                  isActive={isActive}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
