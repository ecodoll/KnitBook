"use client";

import type { Yarn } from "@/components/knitbook/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ProjectYarnSelection = {
  yarnId: string;
  plannedQuantity: string;
  usedQuantity: string;
};

type ProjectYarnPickerProps = {
  yarns: Yarn[];
  value: ProjectYarnSelection[];
  onChange: (next: ProjectYarnSelection[]) => void;
  disabled?: boolean;
};

/**
 * 작품에 사용할 실을 고르고 예정·사용 수량을 입력한다.
 */
const ProjectYarnPicker = ({
  yarns,
  value,
  onChange,
  disabled,
}: ProjectYarnPickerProps) => {
  const selectedById = new Map(value.map((item) => [item.yarnId, item]));

  const toggleYarn = (yarnId: string, checked: boolean) => {
    if (checked) {
      onChange([
        ...value,
        { yarnId, plannedQuantity: "", usedQuantity: "" },
      ]);
      return;
    }

    onChange(value.filter((item) => item.yarnId !== yarnId));
  };

  const updateQuantity = (
    yarnId: string,
    key: "plannedQuantity" | "usedQuantity",
    nextValue: string
  ) => {
    onChange(
      value.map((item) =>
        item.yarnId === yarnId ? { ...item, [key]: nextValue } : item
      )
    );
  };

  if (yarns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        등록된 실이 없어요. 실 메뉴에서 재고를 먼저 넣어 주세요.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {yarns.map((yarn) => {
        const selected = selectedById.get(yarn.id);
        const remaining =
          typeof yarn.remainingGrams === "number"
            ? `${yarn.remainingGrams}g 남음`
            : "잔량 미입력";

        return (
          <li
            key={yarn.id}
            className={cn(
              "rounded-lg border border-border p-3",
              selected ? "bg-secondary/40" : "bg-background"
            )}
          >
            <label className="flex items-start gap-3">
              <Checkbox
                checked={Boolean(selected)}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  toggleYarn(yarn.id, checked === true);
                }}
                aria-label={`${yarn.brand} ${yarn.productName} 선택`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {yarn.brand} · {yarn.productName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {[yarn.colorName, remaining].filter(Boolean).join(" · ")}
                </span>
              </span>
            </label>
            {selected ? (
              <div className="mt-3 grid grid-cols-2 gap-2 pl-7">
                <div className="space-y-1">
                  <Label htmlFor={`planned-${yarn.id}`} className="text-xs">
                    예정 수량
                  </Label>
                  <Input
                    id={`planned-${yarn.id}`}
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={selected.plannedQuantity}
                    onChange={(event) =>
                      updateQuantity(yarn.id, "plannedQuantity", event.target.value)
                    }
                    disabled={disabled}
                    placeholder="볼 또는 g"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`used-${yarn.id}`} className="text-xs">
                    사용 수량
                  </Label>
                  <Input
                    id={`used-${yarn.id}`}
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={selected.usedQuantity}
                    onChange={(event) =>
                      updateQuantity(yarn.id, "usedQuantity", event.target.value)
                    }
                    disabled={disabled}
                    placeholder="선택"
                  />
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default ProjectYarnPicker;
