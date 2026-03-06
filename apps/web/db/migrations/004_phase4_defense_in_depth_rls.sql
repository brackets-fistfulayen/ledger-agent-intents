-- Phase 4 defense-in-depth: Row-Level Security (RLS)
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 004_phase4_defense_in_depth_rls.sql

BEGIN;

-- ----------------------------------------------------------------------------
-- Intents: isolate by owning wallet (user_id)
-- ----------------------------------------------------------------------------
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE intents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS intents_select_policy ON intents;
DROP POLICY IF EXISTS intents_insert_policy ON intents;
DROP POLICY IF EXISTS intents_update_policy ON intents;
DROP POLICY IF EXISTS intents_delete_policy ON intents;

CREATE POLICY intents_select_policy ON intents
	FOR SELECT
	USING (
		current_setting('app.role', true) = 'system'
		OR user_id = NULLIF(current_setting('app.current_user', true), '')
	);

CREATE POLICY intents_insert_policy ON intents
	FOR INSERT
	WITH CHECK (
		current_setting('app.role', true) = 'system'
		OR user_id = NULLIF(current_setting('app.current_user', true), '')
	);

CREATE POLICY intents_update_policy ON intents
	FOR UPDATE
	USING (
		current_setting('app.role', true) = 'system'
		OR user_id = NULLIF(current_setting('app.current_user', true), '')
	)
	WITH CHECK (
		current_setting('app.role', true) = 'system'
		OR user_id = NULLIF(current_setting('app.current_user', true), '')
	);

CREATE POLICY intents_delete_policy ON intents
	FOR DELETE
	USING (
		current_setting('app.role', true) = 'system'
		OR user_id = NULLIF(current_setting('app.current_user', true), '')
	);

-- ----------------------------------------------------------------------------
-- Trustchain members: isolate by trustchain owner wallet (trustchain_id)
-- ----------------------------------------------------------------------------
ALTER TABLE trustchain_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trustchain_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trustchain_members_select_policy ON trustchain_members;
DROP POLICY IF EXISTS trustchain_members_insert_policy ON trustchain_members;
DROP POLICY IF EXISTS trustchain_members_update_policy ON trustchain_members;
DROP POLICY IF EXISTS trustchain_members_delete_policy ON trustchain_members;

CREATE POLICY trustchain_members_select_policy ON trustchain_members
	FOR SELECT
	USING (
		current_setting('app.role', true) = 'system'
		OR trustchain_id = NULLIF(current_setting('app.current_user', true), '')
	);

CREATE POLICY trustchain_members_insert_policy ON trustchain_members
	FOR INSERT
	WITH CHECK (
		current_setting('app.role', true) = 'system'
		OR trustchain_id = NULLIF(current_setting('app.current_user', true), '')
	);

CREATE POLICY trustchain_members_update_policy ON trustchain_members
	FOR UPDATE
	USING (
		current_setting('app.role', true) = 'system'
		OR trustchain_id = NULLIF(current_setting('app.current_user', true), '')
	)
	WITH CHECK (
		current_setting('app.role', true) = 'system'
		OR trustchain_id = NULLIF(current_setting('app.current_user', true), '')
	);

CREATE POLICY trustchain_members_delete_policy ON trustchain_members
	FOR DELETE
	USING (
		current_setting('app.role', true) = 'system'
		OR trustchain_id = NULLIF(current_setting('app.current_user', true), '')
	);

COMMIT;
