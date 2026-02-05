-- Full schema for Agent Intents
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 001_initial_schema.sql

-- ============================================================================
-- 1) Trustchain Members – registry of agent public keys (LKRP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS trustchain_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The root Trustchain identity this member belongs to.
  -- For the initial rollout this is the lowercased wallet address of the
  -- provisioning user (same value stored in auth_sessions.wallet_address).
  trustchain_id TEXT NOT NULL,

  -- Hex-encoded secp256k1 public key (compressed, 33 bytes => 66 hex chars).
  -- This is the only credential the backend stores – never a private key.
  member_pubkey TEXT NOT NULL,

  -- Permission scope.  'agent_write_only' can only POST intents;
  -- 'full_access' is reserved for future interactive sessions.
  role TEXT NOT NULL DEFAULT 'agent_write_only',

  -- User-friendly label (e.g. "Auto-Compounder Bot")
  label TEXT,

  -- EIP-191 personal_sign signature from the Ledger device authorizing this key.
  -- Stored as proof that the device owner approved the agent provisioning.
  authorization_signature TEXT,

  -- Lifecycle timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trustchain_members_trustchain
  ON trustchain_members(trustchain_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trustchain_members_pubkey
  ON trustchain_members(member_pubkey);

ALTER TABLE trustchain_members DROP CONSTRAINT IF EXISTS trustchain_members_role_check;
ALTER TABLE trustchain_members ADD CONSTRAINT trustchain_members_role_check
  CHECK (role IN ('agent_write_only', 'full_access'));

-- ============================================================================
-- 2) Intents – the core intent queue
-- ============================================================================

CREATE TABLE IF NOT EXISTS intents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,

  -- Intent details (stored as JSONB for flexibility)
  details JSONB NOT NULL,

  -- Metadata
  urgency TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,

  -- Transaction data (populated after signing)
  tx_hash TEXT,
  tx_url TEXT,

  -- Trustchain linkage (nullable – anonymous/demo intents have no trustchain)
  trust_chain_id TEXT,
  created_by_member_id UUID REFERENCES trustchain_members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_intents_user_created
  ON intents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intents_user_status_created
  ON intents(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intents_trustchain_created
  ON intents(trust_chain_id, created_at DESC);

ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_status_check;
ALTER TABLE intents ADD CONSTRAINT intents_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'signed', 'authorized', 'confirmed', 'failed', 'expired'));

ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_urgency_check;
ALTER TABLE intents ADD CONSTRAINT intents_urgency_check
  CHECK (urgency IN ('low', 'normal', 'high', 'critical'));

-- ============================================================================
-- 3) Intent status history – append-only audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS intent_status_history (
  id SERIAL PRIMARY KEY,
  intent_id TEXT NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_intent_status_history_intent
  ON intent_status_history(intent_id, timestamp);

-- ============================================================================
-- 4) Auth – per-wallet EIP-712 login challenges & sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_challenges (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  chain_id BIGINT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_wallet_expires
  ON auth_challenges(wallet_address, expires_at DESC);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_wallet_expires
  ON auth_sessions(wallet_address, expires_at DESC);
