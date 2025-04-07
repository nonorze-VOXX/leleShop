drop view if exists "public"."default_artist_view";

drop view if exists "public"."default_commission_view";

drop view if exists "public"."artist_trade";

create table "public"."artist_alias" (
    "artist_alias" text not null,
    "artist_id" integer not null
);


alter table "public"."artist_alias" enable row level security;

alter table "public"."artist" drop column "real_name";

CREATE UNIQUE INDEX artist_alias_pkey ON public.artist_alias USING btree (artist_alias);

alter table "public"."artist_alias" add constraint "artist_alias_pkey" PRIMARY KEY using index "artist_alias_pkey";

alter table "public"."artist_alias" add constraint "artist_alias_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."artist_alias" validate constraint "artist_alias_artist_id_fkey";

create or replace view "public"."artist_alias_map" as  SELECT artist_alias.artist_alias,
    artist.artist_name,
    artist.id
   FROM (artist_alias
     LEFT JOIN artist ON ((artist.id = artist_alias.artist_id)))
  ORDER BY artist.id;


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
    artist_trade.store_name
   FROM (artist
     LEFT JOIN artist_trade ON ((artist_trade.artist_id = artist.id)))
  WHERE artist.visible
  ORDER BY artist.id;


create or replace view "public"."default_commission_view" as  SELECT ac.year_month,
    ac.artist_id,
    ac.store_id,
    a.artist_name,
    s.store_name,
    ac.commission
   FROM ((artist_commission ac
     JOIN artist a ON ((ac.artist_id = a.id)))
     JOIN store s ON ((ac.store_id = s.id)));


grant delete on table "public"."artist_alias" to "anon";

grant insert on table "public"."artist_alias" to "anon";

grant references on table "public"."artist_alias" to "anon";

grant select on table "public"."artist_alias" to "anon";

grant trigger on table "public"."artist_alias" to "anon";

grant truncate on table "public"."artist_alias" to "anon";

grant update on table "public"."artist_alias" to "anon";

grant delete on table "public"."artist_alias" to "authenticated";

grant insert on table "public"."artist_alias" to "authenticated";

grant references on table "public"."artist_alias" to "authenticated";

grant select on table "public"."artist_alias" to "authenticated";

grant trigger on table "public"."artist_alias" to "authenticated";

grant truncate on table "public"."artist_alias" to "authenticated";

grant update on table "public"."artist_alias" to "authenticated";

grant delete on table "public"."artist_alias" to "service_role";

grant insert on table "public"."artist_alias" to "service_role";

grant references on table "public"."artist_alias" to "service_role";

grant select on table "public"."artist_alias" to "service_role";

grant trigger on table "public"."artist_alias" to "service_role";

grant truncate on table "public"."artist_alias" to "service_role";

grant update on table "public"."artist_alias" to "service_role";

create policy "Enable delete for authenticated users only"
on "public"."artist_alias"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."artist_alias"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."artist_alias"
as permissive
for select
to public
using (true);


insert into artist_alias(artist_alias, artist_id)
select artist_name, id
from artist


