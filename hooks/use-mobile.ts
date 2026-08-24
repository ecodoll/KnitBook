import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // 초기 값은 이펙트 바깥 콜백에서 반영해 cascading render 경고를 피한다.
    queueMicrotask(onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
