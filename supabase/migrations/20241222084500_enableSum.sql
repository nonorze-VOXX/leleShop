ALTER ROLE anon SET pgrst.db_aggregates_enabled = 'true';
ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';

-- ALTER USER anon SET plan_filter.statement_cost_limit = 10000;
-- ALTER USER authenticator SET plan_filter.statement_cost_limit = 1e7;
NOTIFY pgrst, 'reload config';
