create table "public"."artist_commission" (
    "artist_id" integer not null,
    "store_id" bigint not null,
    "commission" real
);


alter table "public"."artist_commission" enable row level security;

CREATE UNIQUE INDEX artist_commision_pkey ON public.artist_commission USING btree (artist_id, store_id);

alter table "public"."artist_commission" add constraint "artist_commision_pkey" PRIMARY KEY using index "artist_commision_pkey";

alter table "public"."artist_commission" add constraint "artist_commision_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."artist_commission" validate constraint "artist_commision_artist_id_fkey";

alter table "public"."artist_commission" add constraint "artist_commision_store_id_fkey" FOREIGN KEY (store_id) REFERENCES store(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."artist_commission" validate constraint "artist_commision_store_id_fkey";

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