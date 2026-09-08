import type { ReactNode } from "react";
import Link from "next/link";
import SearchBar from "@/components/knitbook/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type ListToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  searchId: string;
  actionHref: string;
  actionLabel: string;
  /** 검색·등록 아래 줄에 둘 화면별 필터 */
  children?: ReactNode;
  className?: string;
};

/**
 * 목록 화면의 검색·등록 한 줄과 그 아래 필터를 같은 배치로 맞춘다.
 */
const ListToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  searchId,
  actionHref,
  actionLabel,
  children,
  className,
}: ListToolbarProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <SearchBar
          id={searchId}
          className="min-w-0 flex-1"
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={searchLabel}
        />
        <Button
          size="sm"
          className="shrink-0"
          nativeButton={false}
          render={<Link href={actionHref} />}
        >
          <Plus data-icon="inline-start" />
          {actionLabel}
        </Button>
      </div>
      {children}
    </div>
  );
};

export default ListToolbar;
