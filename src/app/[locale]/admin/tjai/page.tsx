import Link from "next/link";

import { requireLocaleParam } from "@/lib/require-locale";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LogRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  route: string;
  task: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  latency_ms: number;
  cost_usd: number;
  ok: boolean;
  error: string | null;
};

function fmtUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

export default async function AdminTjaiPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const admin = getSupabaseServerClient();

  if (!admin) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-semibold">TJAI observability</h1>
        <p className="mt-4 text-white/70">Supabase server client unavailable.</p>
      </div>
    );
  }

  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: rows, error } = await admin
    .from("tjai_ai_call_logs")
    .select(
      "id,created_at,user_id,route,task,model,input_tokens,output_tokens,cache_creation_tokens,cache_read_tokens,latency_ms,cost_usd,ok,error"
    )
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(500);

  const logs = (rows ?? []) as LogRow[];

  const totals = logs.reduce(
    (acc, r) => {
      acc.calls += 1;
      acc.cost += Number(r.cost_usd ?? 0);
      acc.input += r.input_tokens;
      acc.output += r.output_tokens;
      acc.cacheRead += r.cache_read_tokens;
      acc.cacheWrite += r.cache_creation_tokens;
      acc.latency += r.latency_ms;
      if (!r.ok) acc.errors += 1;
      return acc;
    },
    { calls: 0, cost: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, latency: 0, errors: 0 }
  );

  const avgLatency = totals.calls > 0 ? Math.round(totals.latency / totals.calls) : 0;
  const cacheHitRate =
    totals.input + totals.cacheRead > 0
      ? Math.round((totals.cacheRead / (totals.input + totals.cacheRead)) * 100)
      : 0;

  const byRoute = new Map<string, { calls: number; cost: number; latencySum: number }>();
  const byModel = new Map<string, { calls: number; cost: number }>();
  for (const r of logs) {
    const cur = byRoute.get(r.route) ?? { calls: 0, cost: 0, latencySum: 0 };
    cur.calls += 1;
    cur.cost += Number(r.cost_usd ?? 0);
    cur.latencySum += r.latency_ms;
    byRoute.set(r.route, cur);

    const m = byModel.get(r.model) ?? { calls: 0, cost: 0 };
    m.calls += 1;
    m.cost += Number(r.cost_usd ?? 0);
    byModel.set(r.model, m);
  }

  const routeRows = Array.from(byRoute.entries())
    .map(([route, v]) => ({ route, ...v, avgLatency: Math.round(v.latencySum / v.calls) }))
    .sort((a, b) => b.cost - a.cost);

  const modelRows = Array.from(byModel.entries())
    .map(([model, v]) => ({ model, ...v }))
    .sort((a, b) => b.cost - a.cost);

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">TJAI observability</h1>
            <p className="mt-1 text-sm text-white/60">Last 24 hours · Anthropic calls only</p>
          </div>
          <Link
            href={`/${locale}/admin`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            ← Back to admin
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Failed to load logs: {error.message}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Calls (24h)" value={fmtNum(totals.calls)} />
          <Stat label="Spend (24h)" value={fmtUsd(totals.cost)} accent />
          <Stat label="Avg latency" value={`${avgLatency} ms`} />
          <Stat label="Errors" value={fmtNum(totals.errors)} negative={totals.errors > 0} />
          <Stat label="Input tokens" value={fmtNum(totals.input)} />
          <Stat label="Output tokens" value={fmtNum(totals.output)} />
          <Stat label="Cache read" value={fmtNum(totals.cacheRead)} />
          <Stat label="Cache hit rate" value={`${cacheHitRate}%`} accent={cacheHitRate >= 50} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="By route">
            <Table
              head={["Route", "Calls", "Cost", "Avg ms"]}
              rows={routeRows.map((r) => [r.route, fmtNum(r.calls), fmtUsd(r.cost), `${r.avgLatency}`])}
            />
          </Panel>
          <Panel title="By model">
            <Table
              head={["Model", "Calls", "Cost"]}
              rows={modelRows.map((r) => [r.model, fmtNum(r.calls), fmtUsd(r.cost)])}
            />
          </Panel>
        </div>

        <div className="mt-10">
          <Panel title="Recent calls">
            <Table
              head={["Time", "Route", "Model", "Task", "In", "Out", "Cache R/W", "ms", "Cost", "OK"]}
              rows={logs.slice(0, 100).map((r) => [
                new Date(r.created_at).toLocaleTimeString(),
                r.route,
                r.model.replace("claude-", ""),
                r.task,
                fmtNum(r.input_tokens),
                fmtNum(r.output_tokens),
                `${fmtNum(r.cache_read_tokens)}/${fmtNum(r.cache_creation_tokens)}`,
                `${r.latency_ms}`,
                fmtUsd(Number(r.cost_usd ?? 0)),
                r.ok ? "✓" : "✗"
              ])}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  negative
}: {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div
        className={`mt-1 text-2xl font-semibold ${
          negative ? "text-red-300" : accent ? "text-cyan-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5">
      <header className="border-b border-white/10 px-5 py-3 text-sm font-medium text-white/80">{title}</header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: Array<Array<string | number>> }) {
  if (rows.length === 0) {
    return <div className="px-5 py-8 text-center text-sm text-white/50">No data yet.</div>;
  }
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wide text-white/50">
          {head.map((h) => (
            <th key={h} className="px-4 py-2 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-white/5 text-white/80">
            {r.map((c, j) => (
              <td key={j} className="px-4 py-2 font-mono text-xs">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
