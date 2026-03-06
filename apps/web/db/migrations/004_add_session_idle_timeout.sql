-- Add session idle-time tracking for wallet sessions
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 004_add_session_idle_timeout.sql

ALTER TABLE auth_sessions
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_accessed
  ON auth_sessions(last_accessed_at);
