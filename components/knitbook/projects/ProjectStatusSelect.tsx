"use client";

import type { ProjectStatus } from "@/components/knitbook/types";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_OPTIONS,
  getProjectStatusToneClass,
} from "@/components/knitbook/projects/status";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type ProjectStatusSelectProps = {
  status: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * 작품 상태를 배지형 드롭다운으로 고른다.
 */
const ProjectStatusSelect = ({
  status,
  onStatusChange,
  disabled = false,
  className,
}: ProjectStatusSelectProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={cn(
              "h-6 shrink-0 rounded-full px-2.5 font-medium whitespace-nowrap shadow-none hover:opacity-90",
              getProjectStatusToneClass(status),
              className
            )}
            aria-label={`작품 상태 ${PROJECT_STATUS_LABEL[status]}`}
          />
        }
      >
        {PROJECT_STATUS_LABEL[status]}
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => {
            if (
              value === "planned" ||
              value === "in_progress" ||
              value === "paused" ||
              value === "completed"
            ) {
              onStatusChange(value);
            }
          }}
        >
          {PROJECT_STATUS_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectStatusSelect;
