-- x402 hardening: nonce replay protection + executing status + agent index
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 002_x402_hardening.sql

-- ============================================================================
-- 1) Add 'executing' status to the CHECK constraint
-- ============================================================================

ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_status_check;
ALTER TABLE intents ADD CONSTRAINT intents_status_check
  CHECK (status IN (
    'pending', 'approved', 'rejected', 'signed',
    'authorized', 'executing', 'confirmed', 'failed', 'expired'
  ));

-- ============================================================================
-- 2) Nonce replay protection for x402 authorizations
--
-- Each x402 authorization includes a random 32-byte nonce. Without this
-- unique constraint, a buggy or compromised agent could submit the same
-- signed authorization multiple times, each creating a new intent that
-- gets settled -- draining the user's balance.
--
-- The nonce lives at: details.x402.paymentPayload.payload.authorization.nonce
-- (set when the user signs the EIP-3009 authorization on their Ledger).
--
-- Partial index: only applies to intents that have an x402 nonce (non-NULL).
-- Non-x402 intents (standard transfers) are excluded.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_intents_x402_nonce
  ON intents ((details->'x402'->'paymentPayload'->'payload'->'authorization'->>'nonce'))
  WHERE details->'x402'->'paymentPayload'->'payload'->'authorization'->>'nonce' IS NOT NULL;

-- ============================================================================
-- 3) Agent-based index for rate limiting and budget queries
--
-- No index on agent_id exists in the initial schema. This is needed for:
--   - Rate limiting: SELECT COUNT(*) WHERE agent_id = $1 AND created_at > ...
--   - Budget controls: SUM of spending per agent per time window
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_intents_agent_created
  ON intents(agent_id, created_at DESC);
