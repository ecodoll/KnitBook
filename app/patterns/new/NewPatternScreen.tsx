"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PatternUploadForm from "@/components/knitbook/patterns/PatternUploadForm";
import { uploadPattern } from "@/lib/knitbook/pattern-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

/**
 * 도안 업로드 화면을 구성한다.
 */
const NewPatternScreen = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        nativeButton={false}
        render={<Link href="/patterns" />}
      >
        <ChevronLeft data-icon="inline-start" />
        도안 목록
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>도안 올리기</CardTitle>
          <CardDescription>
            PDF 파일과 기본 정보를 입력하면 목록에 저장돼요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatternUploadForm
            isSubmitting={isSubmitting}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              try {
                const pattern = await uploadPattern(values);
                showSuccessToast("도안을 저장했어요", `"${pattern.title}" 도안이 추가됐어요.`);
                router.push(`/patterns/${pattern.id}`);
                router.refresh();
              } catch (error) {
                showNetworkErrorToast(error, "도안을 올리지 못했어요");
                throw error instanceof Error
                  ? error
                  : new Error("도안을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPatternScreen;
