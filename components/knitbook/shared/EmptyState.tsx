import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Next.js 라우트 이동용 링크 */
  actionHref?: string;
  icon?: ReactNode;
  className?: string;
};

/**
 * 데이터가 없을 때 안내와 다음 행동을 보여준다.
 */
const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  icon,
  className,
}: EmptyStateProps) => {
  const showAction = Boolean(actionLabel && (onAction || actionHref));

  return (
    <Empty className={cn("border border-dashed border-border", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon ?? <Inbox />}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {showAction ? (
        <EmptyContent>
          {actionHref ? (
            <Button nativeButton={false} render={<Link href={actionHref} />}>
              {actionLabel}
            </Button>
          ) : (
            <Button type="button" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </EmptyContent>
      ) : null}
    </Empty>
  );
};

export default EmptyState;
