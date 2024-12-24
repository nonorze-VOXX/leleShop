alter table "public"."artist_commission" alter column "effect_from_date" set default (now() AT TIME ZONE 'utc'::text);



