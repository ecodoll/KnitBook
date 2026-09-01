"use client";

import { useState, type FormEvent } from "react";
import type { Pattern, Project, ProjectStatus, Yarn } from "@/components/knitbook/types";
import ProjectYarnPicker, {
  type ProjectYarnSelection,
} from "@/components/knitbook/projects/ProjectYarnPicker";
import ErrorState from "@/components/knitbook/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export type ProjectFormValues = {
  title: string;
  patternId: string;
  status: ProjectStatus;
  size: string;
  startedAt: string;
  targetDate: string;
  completedAt: string;
  notes: string;
  currentRow: string;
  totalRows: string;
  progressPercent: string;
  yarns: ProjectYarnSelection[];
};

type ProjectFormProps = {
  patterns: Pattern[];
  yarns: Yarn[];
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "계획" },
  { value: "in_progress", label: "진행 중" },
  { value: "paused", label: "일시정지" },
  { value: "completed", label: "완료" },
];

const EMPTY_VALUES: ProjectFormValues = {
  title: "",
  patternId: "",
  status: "in_progress",
  size: "",
  startedAt: "",
  targetDate: "",
  completedAt: "",
  notes: "",
  currentRow: "",
  totalRows: "",
  progressPercent: "0",
  yarns: [],
};

/**
 * 작품 도메인 값을 폼 입력으로 변환한다.
 */
const projectToFormValues = (project: Project): ProjectFormValues => {
  return {
    title: project.title,
    patternId: project.patternId ?? "",
    status: project.status,
    size: project.size ?? "",
    startedAt: project.startedAt ?? "",
    targetDate: project.targetDate ?? "",
    completedAt: project.completedAt ?? "",
    notes: project.notes ?? "",
    currentRow: project.currentRow?.toString() ?? "",
    totalRows: project.totalRows?.toString() ?? "",
    progressPercent: project.progressPercent.toString(),
    yarns: (project.yarns ?? []).map((yarn) => ({
      yarnId: yarn.yarnId,
      plannedQuantity: yarn.plannedQuantity?.toString() ?? "",
      usedQuantity: yarn.usedQuantity?.toString() ?? "",
    })),
  };
};

/**
 * 작품명·도안·실·진행 정보를 입력한다.
 */
const ProjectForm = ({
  patterns,
  yarns,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "작품 저장",
}: ProjectFormProps) => {
  const [values, setValues] = useState<ProjectFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    yarns: initialValues?.yarns ?? EMPTY_VALUES.yarns,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!values.title.trim()) {
      setErrorMessage("작품 이름을 입력해 주세요.");
      return;
    }

    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[작품 저장 실패]", error);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "작품을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? <ErrorState title="확인이 필요해요" message={errorMessage} /> : null}

      <div className="space-y-2">
        <Label htmlFor="project-title">작품 이름</Label>
        <Input
          id="project-title"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="예: 겨울 가디건"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="project-status">상태</Label>
          <NativeSelect
            id="project-status"
            className="w-full"
            value={values.status}
            onChange={(event) =>
              updateField("status", event.target.value as ProjectStatus)
            }
            disabled={isSubmitting}
          >
            {STATUS_OPTIONS.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-size">사이즈</Label>
          <Input
            id="project-size"
            value={values.size}
            onChange={(event) => updateField("size", event.target.value)}
            placeholder="예: M"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-pattern">연결 도안</Label>
        <NativeSelect
          id="project-pattern"
          className="w-full"
          value={values.patternId}
          onChange={(event) => updateField("patternId", event.target.value)}
          disabled={isSubmitting}
        >
          <NativeSelectOption value="">연결하지 않음</NativeSelectOption>
          {patterns.map((pattern) => (
            <NativeSelectOption key={pattern.id} value={pattern.id}>
              {pattern.title}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="project-start">시작일</Label>
          <Input
            id="project-start"
            type="date"
            value={values.startedAt}
            onChange={(event) => updateField("startedAt", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-target">목표 완료일</Label>
          <Input
            id="project-target"
            type="date"
            value={values.targetDate}
            onChange={(event) => updateField("targetDate", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="project-row">현재 단수</Label>
          <Input
            id="project-row"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.currentRow}
            onChange={(event) => updateField("currentRow", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-total-row">총 단수</Label>
          <Input
            id="project-total-row"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.totalRows}
            onChange={(event) => updateField("totalRows", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-percent">진행률 (%)</Label>
          <Input
            id="project-percent"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={values.progressPercent}
            onChange={(event) =>
              updateField("progressPercent", event.target.value)
            }
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-notes">메모</Label>
        <Textarea
          id="project-notes"
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="바늘, 주의할 점 등을 남겨 주세요"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">사용할 실</p>
        <ProjectYarnPicker
          yarns={yarns}
          value={values.yarns}
          onChange={(next) => updateField("yarns", next)}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" />
            저장 중…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};

export { projectToFormValues };
export default ProjectForm;
