import type { ComponentProps } from "react"
import KnitSpinner from "@/components/knitbook/shared/KnitSpinner"
import { cn } from "@/lib/utils"

/**
 * 버튼·인라인 로딩에 쓰는 KnitBook 실타래 스피너이다.
 */
const Spinner = ({ className, ...props }: ComponentProps<"svg">) => {
  return (
    <KnitSpinner
      data-slot="spinner"
      className={cn("size-4", className)}
      {...props}
    />
  )
}

export { Spinner }
