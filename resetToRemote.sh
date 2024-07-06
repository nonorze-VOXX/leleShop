supabase db reset --local
supabase db pull
supabase db dump --data-only --schema public > supabase/dump-data.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' < supabase/dump-data.sql
rm supabase/dump-data.sql