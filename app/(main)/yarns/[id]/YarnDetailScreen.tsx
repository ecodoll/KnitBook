"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Yarn } from "@/components/knitbook/types";
import type { YarnLinkedProject } from "@/lib/knitbook/project-data";
import YarnForm, { yarnToFormValues } from "@/components/knitbook/yarns/YarnForm";
import YarnPhoto from "@/components/knitbook/yarns/YarnPhoto";
import YarnStockAdjustForm from "@/components/knitbook/yarns/YarnStockAdjustForm";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import {
  deductYarnStock,
  deleteYarn,
  updateYarn,
} from "@/lib/knitbook/yarn-client";
import {
  showNetworkErrorToast,
  showSuccessToast,
} from "@/lib/knitbook/use-knitbook-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";

type YarnDetailScreenProps = {
  initialYarn: Yarn;
  linkedProjects: YarnLinkedProject[];
};

type YarnInfoRowProps = {
  label: string;
  value?: string | number | null;
  suffix?: string;
};

/**
 * 실 상세의 한 줄 정보를 표시한다.
 */
const YarnInfoRow = ({ label, value, suffix }: YarnInfoRowProps) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right break-words">
        {value}
        {suffix ?? ""}
      </dd>
    </div>
  );
};

/**
 * 실 상세·재고 차감·수정·삭제 화면을 구성한다.
 */
const YarnDetailScreen = ({ initialYarn, linkedProjects }: YarnDetailScreenProps) => {
  const router = useRouter();
  const [yarn, setYarn] = useState(initialYarn);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeducting, setIsDeducting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const remainingLabel =
    typeof yarn.remainingGrams === "number" ? `${yarn.remainingGrams}g` : null;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `${yarn.brand} · ${yarn.productName} 실을 삭제할까요? 이 작업은 되돌릴 수 없어요.`
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteYarn(yarn.id);
      showSuccessToast("실을 삭제했어요");
      router.push("/yarns");
      router.refresh();
    } catch (error) {
      showNetworkErrorToast(error, "실을 삭제하지 못했어요");
      setErrorMessage("실을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          <ChevronLeft data-icon="inline-start" />
          상세로
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>실 정보 수정</CardTitle>
            <CardDescription>
              이름, 색깔, 무게, 사진을 업데이트해요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <YarnForm
              initialValues={yarnToFormValues(yarn)}
              currentImageUrl={yarn.imageUrl}
              isSubmitting={isSaving}
              submitLabel="변경 저장"
              onSubmit={async (values) => {
                setIsSaving(true);
                try {
                  const next = await updateYarn(yarn.id, values);
                  setYarn(next);
                  setIsEditing(false);
                  showSuccessToast("실 정보를 수정했어요");
                  router.refresh();
                } catch (error) {
                  showNetworkErrorToast(error, "실 정보를 수정하지 못했어요");
                  throw error instanceof Error
                    ? error
                    : new Error("실 정보를 수정하지 못했어요. 잠시 후 다시 시도해 주세요.");
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
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
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsEditing(true)}
            aria-label="실 정보 수정"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            aria-label="실 삭제"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <ErrorState title="처리하지 못했어요" message={errorMessage} />
      ) : null}

      <Card size="sm">
        <CardHeader className="space-y-3">
          <YarnPhoto yarn={yarn} large />
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg">{yarn.productName}</CardTitle>
            <CardDescription>
              {[yarn.brand, yarn.colorName].filter(Boolean).join(" · ") || "정보 미입력"}
            </CardDescription>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {remainingLabel ? (
                <Badge variant="secondary">남은 무게 {remainingLabel}</Badge>
              ) : null}
              {yarn.isInUse ? (
                <Badge className="bg-brand-berry text-brand-berry-foreground">
                  사용 중
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl>
            <YarnInfoRow label="브랜드" value={yarn.brand} />
            <YarnInfoRow label="색깔" value={yarn.colorName} />
            <YarnInfoRow label="제품번호" value={yarn.productCode} />
            <YarnInfoRow label="무게" value={yarn.weightGrams} suffix="g" />
            <YarnInfoRow
              label="남은 무게"
              value={yarn.remainingGrams}
              suffix="g"
            />
            <YarnInfoRow label="메모" value={yarn.notes} />
          </dl>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>연결된 작품</CardTitle>
          <CardDescription>이 실을 사용하는 작품이에요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 이 실을 쓰는 작품이 없어요.
            </p>
          ) : (
            <ul className="space-y-2">
              {linkedProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/40"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href={`/projects/new?yarnId=${yarn.id}`} />}
          >
            작품에 사용
          </Button>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>재고 차감</CardTitle>
          <CardDescription>사용한 만큼 남은 무게에서 빼요.</CardDescription>
        </CardHeader>
        <CardContent>
          <YarnStockAdjustForm
            remainingGrams={yarn.remainingGrams}
            isSubmitting={isDeducting}
            onSubmit={async (grams) => {
              setIsDeducting(true);
              try {
                const next = await deductYarnStock(yarn.id, grams);
                setYarn(next);
                showSuccessToast("재고를 차감했어요", `지금 ${next.remainingGrams ?? 0}g 남았어요.`);
                router.refresh();
              } finally {
                setIsDeducting(false);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default YarnDetailScreen;
