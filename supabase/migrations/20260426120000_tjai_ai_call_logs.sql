-- Telemetry for every TJAI AI call: model routing, cache, cost, latency.
CREATE TABLE IF NOT EXISTS tjai_ai_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  route text NOT NULL,
  task text NOT NULL,
  provider text NOT NULL DEFAULT 'anthropic',
  model text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  cache_creation_tokens integer NOT NULL DEFAULT 0,
  cache_read_tokens integer NOT NULL DEFAULT 0,
  latency_ms integer NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  ok boolean NOT NULL DEFAULT true,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tjai_ai_call_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages tjai_ai_call_logs" ON tjai_ai_call_logs;
CREATE POLICY "Service role manages tjai_ai_call_logs" ON tjai_ai_call_logs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read tjai_ai_call_logs" ON tjai_ai_call_logs;
CREATE POLICY "Admins read tjai_ai_call_logs" ON tjai_ai_call_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_tjai_ai_call_logs_created ON tjai_ai_call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tjai_ai_call_logs_user_created ON tjai_ai_call_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tjai_ai_call_logs_route_created ON tjai_ai_call_logs(route, created_at DESC);
