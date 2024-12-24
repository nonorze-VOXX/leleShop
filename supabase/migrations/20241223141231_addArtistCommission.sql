drop view if exists "public"."default_artist_view";

drop view if exists "public"."artist_trade";

create table "public"."artist_commission" (
    "artist_id" integer not null,
    "store_id" bigint not null,
    "commission" real
);


alter table "public"."artist_commission" enable row level security;

alter table "public"."store" drop column "default_commision";

alter table "public"."store" add column "default_commission" real not null default '10'::real;

CREATE UNIQUE INDEX artist_commision_pkey ON public.artist_commission USING btree (artist_id, store_id);

alter table "public"."artist_commission" add constraint "artist_commision_pkey" PRIMARY KEY using index "artist_commision_pkey";

alter table "public"."artist_commission" add constraint "artist_commision_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."artist_commission" validate constraint "artist_commision_artist_id_fkey";

alter table "public"."artist_commission" add constraint "artist_commision_store_id_fkey" FOREIGN KEY (store_id) REFERENCES store(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."artist_commission" validate constraint "artist_commision_store_id_fkey";

create or replace view "public"."artist_trade" as  SELECT a.artist_name,
    b.id,
    b.trade_id,
    b.item_name,
    b.quantity,
    b.total_sales,
    b.discount,
    b.net_sales,
    b.artist_id,
    h.trade_date,
    s.store_name
   FROM (((artist a
     JOIN trade_body b ON ((a.id = b.artist_id)))
     JOIN trade_head h ON ((b.trade_id = h.trade_id)))
     LEFT JOIN store s ON ((s.id = h.store_id)));


create or replace view "public"."default_artist_view" as  SELECT DISTINCT artist.id,
    artist.artist_name,
    artist.report_key,
    artist.visible,
    artist.payment,
    artist_trade.store_name
   FROM (artist
     LEFT JOIN artist_trade ON ((artist_trade.artist_id = artist.id)))
  WHERE artist.visible
  ORDER BY artist.id;


grant delete on table "public"."artist_commission" to "anon";

grant insert on table "public"."artist_commission" to "anon";

grant references on table "public"."artist_commission" to "anon";

grant select on table "public"."artist_commission" to "anon";

grant trigger on table "public"."artist_commission" to "anon";

grant truncate on table "public"."artist_commission" to "anon";

grant update on table "public"."artist_commission" to "anon";

grant delete on table "public"."artist_commission" to "authenticated";

grant insert on table "public"."artist_commission" to "authenticated";

grant references on table "public"."artist_commission" to "authenticated";

grant select on table "public"."artist_commission" to "authenticated";

grant trigger on table "public"."artist_commission" to "authenticated";

grant truncate on table "public"."artist_commission" to "authenticated";

grant update on table "public"."artist_commission" to "authenticated";

grant delete on table "public"."artist_commission" to "service_role";

grant insert on table "public"."artist_commission" to "service_role";

grant references on table "public"."artist_commission" to "service_role";

grant select on table "public"."artist_commission" to "service_role";

grant trigger on table "public"."artist_commission" to "service_role";

grant truncate on table "public"."artist_commission" to "service_role";

grant update on table "public"."artist_commission" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."artist_commission"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."artist_commission"
as permissive
for select
to public
using (true);


create policy "Enable update for authenticated users only"
on "public"."artist_commission"
as permissive
for update
to authenticated
using (true);




INSERT INTO artist_commission (artist_id, store_id, commission)
select distinct
a.artist_id,
 s.id AS store_id , 
10 AS commission
from artist_trade a join store s on a.store_name = s.store_name
