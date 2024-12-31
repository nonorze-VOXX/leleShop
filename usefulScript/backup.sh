#!/bin/bash
npx supabase db dump --linked -f roles.sql --role-only
npx supabase db dump --linked -f schema.sql
npx supabase db dump --linked -f data.sql  --data-only


