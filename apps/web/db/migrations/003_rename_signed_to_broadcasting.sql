-- Rename 'signed' status to 'broadcasting' for clarity
-- The intent has been signed on the Ledger and the transaction is now broadcasting.
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 003_rename_signed_to_broadcasting.sql

-- ============================================================================
-- 1) Drop the old CHECK constraint first (so we can update data)
-- ============================================================================

ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_status_check;

-- ============================================================================
-- 2) Update existing rows: 'signed' → 'broadcasting'
-- ============================================================================

UPDATE intents SET status = 'broadcasting' WHERE status = 'signed';
UPDATE intent_status_history SET status = 'broadcasting' WHERE status = 'signed';

-- ============================================================================
-- 3) Re-add the CHECK constraint with 'broadcasting' instead of 'signed'
-- ============================================================================

ALTER TABLE intents ADD CONSTRAINT intents_status_check
  CHECK (status IN (
    'pending', 'approved', 'rejected', 'broadcasting',
    'authorized', 'executing', 'confirmed', 'failed', 'expired'
  ));

-- ============================================================================
-- 4) Rename the column signed_at → broadcast_at
-- ============================================================================

ALTER TABLE intents RENAME COLUMN signed_at TO broadcast_at;
