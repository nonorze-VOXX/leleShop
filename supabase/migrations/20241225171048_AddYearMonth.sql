drop view if exists "public"."default_commission_view";

alter table "public"."artist_commission" drop constraint "artist_commission_pkey";

drop index if exists "public"."artist_commission_pkey";

alter table "public"."artist_commission" drop column "effect_from_date";

alter table "public"."artist_commission" add column "year_month" text not null;

CREATE UNIQUE INDEX artist_commission_pkey ON public.artist_commission USING btree (artist_id, store_id, year_month);

alter table "public"."artist_commission" add constraint "artist_commission_pkey" PRIMARY KEY using index "artist_commission_pkey";



