create type "public"."processenum" as enum ('todo', 'doing', 'done');

create table "public"."artist_payment_status" (
    "id" integer generated always as identity not null,
    "create_time" date,
    "process_state" processenum,
    "artist_id" bigint
);


alter table "public"."artist_payment_status" enable row level security;

CREATE UNIQUE INDEX artist_payment_status_pkey ON public.artist_payment_status USING btree (id);

alter table "public"."artist_payment_status" add constraint "artist_payment_status_pkey" PRIMARY KEY using index "artist_payment_status_pkey";

alter table "public"."artist_payment_status" add constraint "artist_payment_status_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist(id) not valid;

alter table "public"."artist_payment_status" validate constraint "artist_payment_status_artist_id_fkey";

grant delete on table "public"."artist_payment_status" to "anon";

grant insert on table "public"."artist_payment_status" to "anon";

grant references on table "public"."artist_payment_status" to "anon";

grant select on table "public"."artist_payment_status" to "anon";

grant trigger on table "public"."artist_payment_status" to "anon";

grant truncate on table "public"."artist_payment_status" to "anon";

grant update on table "public"."artist_payment_status" to "anon";

grant delete on table "public"."artist_payment_status" to "authenticated";

grant insert on table "public"."artist_payment_status" to "authenticated";

grant references on table "public"."artist_payment_status" to "authenticated";

grant select on table "public"."artist_payment_status" to "authenticated";

grant trigger on table "public"."artist_payment_status" to "authenticated";

grant truncate on table "public"."artist_payment_status" to "authenticated";

grant update on table "public"."artist_payment_status" to "authenticated";

grant delete on table "public"."artist_payment_status" to "service_role";

grant insert on table "public"."artist_payment_status" to "service_role";

grant references on table "public"."artist_payment_status" to "service_role";

grant select on table "public"."artist_payment_status" to "service_role";

grant trigger on table "public"."artist_payment_status" to "service_role";

grant truncate on table "public"."artist_payment_status" to "service_role";

grant update on table "public"."artist_payment_status" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."artist_payment_status"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable read access for all users"
on "public"."artist_payment_status"
as permissive
for select
to public
using (true);




