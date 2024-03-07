drop policy "Enable insert for authenticated users only" on "public"."countries";

drop policy "Enable read access for all users" on "public"."countries";

drop policy "Enable insert for authenticated users only" on "public"."trade_body";

drop policy "Enable insert for authenticated users only" on "public"."trade_head";

revoke delete on table "public"."countries" from "anon";

revoke insert on table "public"."countries" from "anon";

revoke references on table "public"."countries" from "anon";

revoke select on table "public"."countries" from "anon";

revoke trigger on table "public"."countries" from "anon";

revoke truncate on table "public"."countries" from "anon";

revoke update on table "public"."countries" from "anon";

revoke delete on table "public"."countries" from "authenticated";

revoke insert on table "public"."countries" from "authenticated";

revoke references on table "public"."countries" from "authenticated";

revoke select on table "public"."countries" from "authenticated";

revoke trigger on table "public"."countries" from "authenticated";

revoke truncate on table "public"."countries" from "authenticated";

revoke update on table "public"."countries" from "authenticated";

revoke delete on table "public"."countries" from "service_role";

revoke insert on table "public"."countries" from "service_role";

revoke references on table "public"."countries" from "service_role";

revoke select on table "public"."countries" from "service_role";

revoke trigger on table "public"."countries" from "service_role";

revoke truncate on table "public"."countries" from "service_role";

revoke update on table "public"."countries" from "service_role";

alter table "public"."countries" drop constraint "countries_pkey";

drop index if exists "public"."countries_pkey";

drop table "public"."countries";

alter table "public"."artist" enable row level security;

alter table "public"."posts" enable row level security;

drop sequence if exists "public"."countries_id_seq";

create policy "Enable all for authenticated users only"
on "public"."artist"
as permissive
for all
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."artist"
as permissive
for select
to public
using (true);


create policy "Enable insert for authenticated users only"
on "public"."posts"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable read access for all users"
on "public"."posts"
as permissive
for select
to public
using (true);


create policy "Enable insert for authenticated users only"
on "public"."trade_body"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."trade_head"
as permissive
for all
to authenticated
using (true)
with check (true);




