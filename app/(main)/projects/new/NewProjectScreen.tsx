"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Pattern, Yarn } from "@/components/knitbook/types";
import ProjectForm from "@/components/knitbook/projects/ProjectForm";
import { createProject } from "@/lib/knitbook/project-client";
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

type NewProjectScreenProps = {
  patterns: Pattern[];
  yarns: Yarn[];
  defaultTitle?: string;
  defaultPatternId?: string;
  defaultYarnId?: string;
};

/**
 * 새 작품 생성 화면을 구성한다.
 */
const NewProjectScreen = ({
  patterns,
  yarns,
  defaultTitle,
  defaultPatternId,
  defaultYarnId,
}: NewProjectScreenProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        nativeButton={false}
        render={<Link href="/projects" />}
      >
        <ChevronLeft data-icon="inline-start" />
        작품 목록
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>새 작품</CardTitle>
          <CardDescription>
            도안과 사용할 실을 연결하면 진행 상황을 기록할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            patterns={patterns}
            yarns={yarns}
            initialValues={{
              title: defaultTitle ?? "",
              patternId: defaultPatternId ?? "",
              status: "in_progress",
              yarns:
                defaultYarnId && yarns.some((yarn) => yarn.id === defaultYarnId)
                  ? [
                      {
                        yarnId: defaultYarnId,
                        plannedQuantity: "",
                        usedQuantity: "",
                      },
                    ]
                  : [],
            }}
            isSubmitting={isSubmitting}
            submitLabel="작품 만들기"
            onSubmit={async (values) => {
              setIsSubmitting(true);
              try {
                const project = await createProject(values);
                showSuccessToast("작품을 만들었어요", `"${project.title}" 작품을 시작할 수 있어요.`);
                router.push(`/projects/${project.id}`);
                router.refresh();
              } catch (error) {
                showNetworkErrorToast(error, "작품을 만들지 못했어요");
                throw error instanceof Error
                  ? error
                  : new Error("작품을 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
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

export default NewProjectScreen;
