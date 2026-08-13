import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  /** 사용자에게 보여줄 한글 메시지 */
  message?: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

/**
 * 오류 발생 시 친절한 한글 안내와 재시도 버튼을 표시한다.
 */
const ErrorState = ({
  title = "문제가 발생했어요",
  message = "잠시 후 다시 시도해 주세요.",
  onRetry,
  className,
}: ErrorStateProps) => {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{message}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={onRetry}
          >
            다시 시도
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;
