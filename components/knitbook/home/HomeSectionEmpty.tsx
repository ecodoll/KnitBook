import Link from "next/link";
import { Button } from "@/components/ui/button";

type HomeSectionEmptyProps = {
  message: string;
  actionLabel: string;
  actionHref: string;
};

/**
 * 홈 섹션의 짧은 빈 상태 안내와 다음 행동을 보여준다.
 */
const HomeSectionEmpty = ({
  message,
  actionLabel,
  actionHref,
}: HomeSectionEmptyProps) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card/70 px-3 py-2.5">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        variant="ghost"
        size="xs"
        className="shrink-0"
        nativeButton={false}
        render={<Link href={actionHref} />}
      >
        {actionLabel}
      </Button>
    </div>
  );
};

export default HomeSectionEmpty;
