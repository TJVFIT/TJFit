"use client";

import { cn } from "@/lib/utils";

type BodyType = "Very Lean" | "Lean" | "Average" | "Overweight" | "Obese";

type SilhouetteOption = {
  bodyType: BodyType;
  estimatedBF: number;
  bfRange: string;
  scale: number;
};

const OPTIONS: SilhouetteOption[] = [
  { bodyType: "Very Lean", estimatedBF: 10, bfRange: "~8-12%", scale: 0.84 },
  { bodyType: "Lean", estimatedBF: 16, bfRange: "~13-18%", scale: 0.92 },
  { bodyType: "Average", estimatedBF: 22, bfRange: "~19-25%", scale: 1 },
  { bodyType: "Overweight", estimatedBF: 30, bfRange: "~26-34%", scale: 1.1 },
  { bodyType: "Obese", estimatedBF: 38, bfRange: "~35%+", scale: 1.2 }
];

const MALE_PATH = "M50 7c8 0 14 6 14 14v14c0 6-4 10-8 12v10h8c7 0 12 5 12 12v18c0 6-4 10-10 10h-3v25c0 6-4 10-10 10h-6c-6 0-10-4-10-10V97h-3c-6 0-10-4-10-10V69c0-7 5-12 12-12h8V47c-4-2-8-6-8-12V21c0-8 6-14 14-14Z";
const FEMALE_PATH = "M50 7c7 0 13 6 13 13v14c0 5-3 9-7 11v12l10 8c4 3 6 8 6 13v9c0 6-4 10-10 10h-2v25c0 6-4 10-10 10h-5c-6 0-10-4-10-10V97h-2c-6 0-10-4-10-10v-9c0-5 2-10 6-13l10-8V45c-4-2-7-6-7-11V20c0-7 6-13 13-13Z";

export function BodySilhouetteSelector({
  gender,
  value,
  onSelect
}: {
  gender?: string;
  value?: BodyType;
  onSelect: (selection: { bodyType: BodyType; estimatedBF: number }) => void;
}) {
  const isFemale = (gender ?? "").toLowerCase().startsWith("female");
  const bodyPath = isFemale ? FEMALE_PATH : MALE_PATH;

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-3 sm:gap-4">
        {OPTIONS.map((option) => {
          const selected = option.bodyType === value;
          return (
            <button
              key={option.bodyType}
              type="button"
              onClick={() => onSelect({ bodyType: option.bodyType, estimatedBF: option.estimatedBF })}
              className={cn(
                "w-[130px] rounded-xl border p-3 text-center transition-all sm:w-[150px]",
                selected ? "border-[#22D3EE] bg-[rgba(34,211,238,0.06)]" : "border-[#1E2028] bg-[#111215] hover:border-[rgba(34,211,238,0.4)]"
              )}
            >
              <svg
                viewBox="0 0 100 140"
                className={cn("mx-auto h-[110px] w-auto sm:h-[140px]", selected && "drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]")}
              >
                <g transform={`translate(50,70) scale(${option.scale}) translate(-50,-70)`}>
                  <path d={bodyPath} fill={selected ? "rgba(34,211,238,0.06)" : "transparent"} stroke={selected ? "#22D3EE" : "#1E2028"} strokeWidth="2.2" />
                </g>
              </svg>
              <div className={cn("mt-2 text-xs font-medium", selected ? "text-white" : "text-[#A1A1AA]")}>{option.bodyType}</div>
              <div className="mt-1 text-[10px] text-[#52525B]">{option.bfRange}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

