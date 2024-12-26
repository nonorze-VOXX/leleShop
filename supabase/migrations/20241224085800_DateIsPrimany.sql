alter table "public"."artist_commission" drop constraint "artist_commision_pkey";

drop index if exists "public"."artist_commision_pkey";

CREATE UNIQUE INDEX artist_commission_pkey ON public.artist_commission USING btree (artist_id, store_id, effect_from_date);

alter table "public"."artist_commission" add constraint "artist_commission_pkey" PRIMARY KEY using index "artist_commission_pkey";



