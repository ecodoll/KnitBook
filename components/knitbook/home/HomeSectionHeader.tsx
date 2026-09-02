import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type HomeSectionHeaderProps = {
  id: string;
  title: string;
  icon: LucideIcon;
  children?: ReactNode;
};

/**
 * 홈 섹션 제목과 우측 짧은 액션을 한 줄로 표시한다.
 */
const HomeSectionHeader = ({
  id,
  title,
  icon: Icon,
  children,
}: HomeSectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 id={id} className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {title}
      </h2>
      {children ? <div className="flex items-center gap-0.5">{children}</div> : null}
    </div>
  );
};

export default HomeSectionHeader;
