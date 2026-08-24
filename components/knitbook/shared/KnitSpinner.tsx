import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type KnitSpinnerProps = ComponentProps<"svg"> & {
  /** 접근성 라벨. 장식용일 때는 생략한다. */
  label?: string;
};

/**
 * 실타래가 감기는 KnitBook 공통 로딩 스피너이다.
 */
const KnitSpinner = ({
  className,
  label = "불러오는 중",
  ...props
}: KnitSpinnerProps) => {
  const isHidden =
    props["aria-hidden"] === true || props["aria-hidden"] === "true";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-slot="spinner"
      role={isHidden ? undefined : "status"}
      aria-label={isHidden ? undefined : label}
      className={cn(
        "size-4 animate-spin motion-reduce:animate-none [animation-duration:1.15s]",
        className
      )}
      {...props}
    >
      {!isHidden ? <title>{label}</title> : null}
      <circle cx="15.5" cy="15" r="8.25" className="fill-current opacity-15" />
      <circle
        cx="15.5"
        cy="15"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8.6 13.2c2.4 1.15 11.4 1.15 13.8 0"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M8.6 16.8c2.4 1.15 11.4 1.15 13.8 0"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M12.1 8c1.45 2.9 1.45 10.2 0 13.1"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M18.9 8c-1.45 2.9-1.45 10.2 0 13.1"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M22.4 20.8c2.1 1.15 3.4 3.35 2.35 5.15"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="26.4" r="1.15" fill="currentColor" />
    </svg>
  );
};

export default KnitSpinner;
