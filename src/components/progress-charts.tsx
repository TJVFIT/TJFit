"use client";

import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

type ChartPoint = {
  date: string;
  weight: number | null;
  fat: number | null;
};

// ME19 — Custom Recharts tooltip showing both metrics
function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  };
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(13,14,18,0.95)",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 0 20px rgba(168,85,247,0.12), 0 8px 32px rgba(0,0,0,0.5)",
        fontSize: 12
      }}
    >
      <p style={{ color: "#52525B", marginBottom: 6, fontSize: 11 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name === "weight" ? "Weight" : "Body Fat"}: <strong>{p.value}{p.name === "weight" ? " kg" : "%"}</strong>
        </p>
      ))}
    </div>
  );
}

export default function ProgressCharts({ chartData }: { chartData: ChartPoint[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-panel rounded-[28px] p-6">
        <p className="mb-4 text-sm font-semibold text-white">Weight trend (kg)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} />
            <YAxis tick={{ fill: "#52525B", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}kg`} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#A855F7"
              strokeWidth={2}
              fill="url(#weightGrad)"
              dot={{ r: 3, fill: "#A855F7" }}
              connectNulls
              isAnimationActive
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-panel rounded-[28px] p-6">
        <p className="mb-4 text-sm font-semibold text-white">Body fat trend (%)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} />
            <YAxis tick={{ fill: "#52525B", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="fat"
              stroke="#7C3AED"
              strokeWidth={2}
              fill="url(#fatGrad)"
              dot={{ r: 3, fill: "#7C3AED" }}
              connectNulls
              isAnimationActive
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
