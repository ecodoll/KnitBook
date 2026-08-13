"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** 접근성용 레이블 */
  label?: string;
};

/**
 * 도안·실·작품 목록용 공통 검색 입력창이다.
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "검색어를 입력하세요",
  className,
  label = "검색",
}: SearchBarProps) => {
  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor="knitbook-search">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id="knitbook-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
};

export default SearchBar;
