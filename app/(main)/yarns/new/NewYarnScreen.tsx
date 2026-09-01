"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import YarnForm from "@/components/knitbook/yarns/YarnForm";
import { createYarn } from "@/lib/knitbook/yarn-client";
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
 * 새 실 재고 등록 화면을 구성한다.
 */
const NewYarnScreen = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        nativeButton={false}
        render={<Link href="/yarns" />}
      >
        <ChevronLeft data-icon="inline-start" />
        실 목록
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>실 등록</CardTitle>
          <CardDescription>
            실 이름과 브랜드, 사진을 입력하면 재고에 저장돼요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <YarnForm
            isSubmitting={isSubmitting}
            submitLabel="실 저장"
            onSubmit={async (values) => {
              setIsSubmitting(true);
              try {
                const yarn = await createYarn(values);
                showSuccessToast(
                  "실을 등록했어요",
                  `${yarn.brand} · ${yarn.productName}을(를) 재고에 넣었어요.`
                );
                router.push(`/yarns/${yarn.id}`);
                router.refresh();
              } catch (error) {
                showNetworkErrorToast(error, "실을 등록하지 못했어요");
                throw error instanceof Error
                  ? error
                  : new Error("실을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.");
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

export default NewYarnScreen;
