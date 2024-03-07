create table "public"."artist" (
    "id" integer generated always as identity not null,
    "artist_name" text
);


alter table "public"."trade_body" drop column "artist_name";

alter table "public"."trade_body" add column "artist_id" integer;

CREATE UNIQUE INDEX artist_pkey ON public.artist USING btree (id);

alter table "public"."artist" add constraint "artist_pkey" PRIMARY KEY using index "artist_pkey";

alter table "public"."trade_body" add constraint "trade_body_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artist(id) not valid;

alter table "public"."trade_body" validate constraint "trade_body_artist_id_fkey";

grant delete on table "public"."artist" to "anon";

grant insert on table "public"."artist" to "anon";

grant references on table "public"."artist" to "anon";

grant select on table "public"."artist" to "anon";

grant trigger on table "public"."artist" to "anon";

grant truncate on table "public"."artist" to "anon";

grant update on table "public"."artist" to "anon";

grant delete on table "public"."artist" to "authenticated";

grant insert on table "public"."artist" to "authenticated";

grant references on table "public"."artist" to "authenticated";

grant select on table "public"."artist" to "authenticated";

grant trigger on table "public"."artist" to "authenticated";

grant truncate on table "public"."artist" to "authenticated";

grant update on table "public"."artist" to "authenticated";

grant delete on table "public"."artist" to "service_role";

grant insert on table "public"."artist" to "service_role";

grant references on table "public"."artist" to "service_role";

grant select on table "public"."artist" to "service_role";

grant trigger on table "public"."artist" to "service_role";

grant truncate on table "public"."artist" to "service_role";

grant update on table "public"."artist" to "service_role";



