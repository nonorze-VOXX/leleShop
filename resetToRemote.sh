#!/bin/bash

npx supabase db reset --local
npx supabase db pull
npx supabase db dump --data-only --schema public > supabase/dump-data.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' < supabase/dump-data.sql
rm supabase/dump-data.sql