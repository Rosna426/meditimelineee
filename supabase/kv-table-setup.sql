-- Create KV Store table for prescription data
CREATE TABLE IF NOT EXISTS kv_store_d794bcda (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_d794bcda(key);

-- Enable RLS
ALTER TABLE kv_store_d794bcda ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything (for edge function)
CREATE POLICY "Service role has full access" ON kv_store_d794bcda
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
