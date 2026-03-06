-- Track used AgentAuth signatures to prevent replay attacks
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 005_add_agentauth_used_nonces.sql

CREATE TABLE IF NOT EXISTS agentauth_used_nonces (
  signature_hash TEXT PRIMARY KEY,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agentauth_used_nonces_used_at
  ON agentauth_used_nonces(used_at);
