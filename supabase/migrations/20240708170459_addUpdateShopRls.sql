
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."processenum" AS ENUM (
    'todo',
    'doing',
    'done'
);

ALTER TYPE "public"."processenum" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_total_trade"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS "record"
    LANGUAGE "plpgsql"
    AS $_$begin
return (
  (
  select sum(total_sales)from artist_trade
  where 
  $1=artist_trade.artist_id and
  trade_date>=start_date and 
  trade_date < end_date
  ),
  (
    select sum(net_sales) as net_total
    from artist_trade
    where 
    $1=artist_trade.artist_id and
    trade_date>=start_date and 
    trade_date < end_date
  ),(
    select sum(discount) as discount_total
    from artist_trade 
    where 
    $1=artist_trade.artist_id and
    trade_date>=start_date and 
    trade_date < end_date
  ),(
    select sum(quantity) as quantity_total
    from artist_trade
    where 
    $1=artist_trade.artist_id and
    trade_date>=start_date and 
    trade_date < end_date
  )
);
end;$_$;

ALTER FUNCTION "public"."get_total_trade"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_total_trade_with_shop"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "shop_id" integer) RETURNS "record"
    LANGUAGE "plpgsql"
    AS $_$begin
return (
  (
  select sum(total_sales)from artist_trade_with_shop atws
  where 
  $1=atws.artist_id and
  trade_date>=start_date and 
  trade_date < end_date and 
  $4=atws.shop_id
  ),
  (
    select sum(net_sales) as net_total
    from artist_trade_with_shop atws
    where 
    $1=atws.artist_id and
    trade_date>=start_date and 
    trade_date < end_date and 
  $4=atws.shop_id
  ),(
    select sum(discount) as discount_total
    from artist_trade_with_shop atws
    where 
    $1=atws.artist_id and
    trade_date>=start_date and 
    trade_date < end_date and 
  $4=atws.shop_id
  ),(
    select sum(quantity) as quantity_total
    from artist_trade_with_shop atws
    where 
    $1=atws.artist_id and
    trade_date>=start_date and 
    trade_date < end_date and 
  $4=atws.shop_id
  )
);
end$_$;

ALTER FUNCTION "public"."get_total_trade_with_shop"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "shop_id" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."artist" (
    "id" integer NOT NULL,
    "artist_name" "text" NOT NULL,
    "report_key" character varying(255),
    "visible" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."artist" OWNER TO "postgres";

ALTER TABLE "public"."artist" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."artist_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."artist_payment_status" (
    "id" integer NOT NULL,
    "artist_id" bigint,
    "state_by_season" bigint,
    "season" bigint
);

ALTER TABLE "public"."artist_payment_status" OWNER TO "postgres";

ALTER TABLE "public"."artist_payment_status" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."artist_payment_status_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."trade_body" (
    "id" bigint NOT NULL,
    "trade_id" "text" NOT NULL,
    "item_name" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "total_sales" numeric NOT NULL,
    "discount" numeric NOT NULL,
    "net_sales" numeric NOT NULL,
    "artist_id" integer NOT NULL
);

ALTER TABLE "public"."trade_body" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."trade_head" (
    "trade_date" timestamp with time zone NOT NULL,
    "trade_id" "text" NOT NULL,
    "shop_id" bigint NOT NULL
);

ALTER TABLE "public"."trade_head" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."artist_trade" WITH ("security_invoker"='on') AS
 SELECT "a"."artist_name",
    "b"."id",
    "b"."trade_id",
    "b"."item_name",
    "b"."quantity",
    "b"."total_sales",
    "b"."discount",
    "b"."net_sales",
    "b"."artist_id",
    "h"."trade_date"
   FROM (("public"."artist" "a"
     JOIN "public"."trade_body" "b" ON (("a"."id" = "b"."artist_id")))
     JOIN "public"."trade_head" "h" ON (("b"."trade_id" = "h"."trade_id")));

ALTER TABLE "public"."artist_trade" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."shop" (
    "id" bigint NOT NULL,
    "shop_name" "text" DEFAULT 'where'::"text" NOT NULL,
    "commission" double precision DEFAULT '90'::double precision NOT NULL,
    CONSTRAINT "shop_commission_check" CHECK ((("commission" >= (0)::double precision) AND ("commission" <= (100)::double precision)))
);

ALTER TABLE "public"."shop" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."artist_trade_with_shop" WITH ("security_invoker"='on') AS
 SELECT "a"."artist_name",
    "b"."id",
    "b"."trade_id",
    "b"."item_name",
    "b"."quantity",
    "b"."total_sales",
    "b"."discount",
    "b"."net_sales",
    "b"."artist_id",
    "h"."trade_date",
    "s"."id" AS "shop_id",
    "s"."shop_name",
    "s"."commission"
   FROM ((("public"."artist" "a"
     JOIN "public"."trade_body" "b" ON (("a"."id" = "b"."artist_id")))
     JOIN "public"."trade_head" "h" ON (("b"."trade_id" = "h"."trade_id")))
     JOIN "public"."shop" "s" ON (("h"."shop_id" = "s"."id")));

ALTER TABLE "public"."artist_trade_with_shop" OWNER TO "postgres";

ALTER TABLE "public"."shop" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."shop_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."trade_body" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."trade_body_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."artist_payment_status"
    ADD CONSTRAINT "artist_payment_status_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."artist"
    ADD CONSTRAINT "artist_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shop"
    ADD CONSTRAINT "shop_name_key" UNIQUE ("shop_name");

ALTER TABLE ONLY "public"."shop"
    ADD CONSTRAINT "shop_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."trade_body"
    ADD CONSTRAINT "trade_body_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."trade_head"
    ADD CONSTRAINT "trade_head_pkey" PRIMARY KEY ("trade_id");

ALTER TABLE ONLY "public"."artist_payment_status"
    ADD CONSTRAINT "artist_payment_status_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id");

ALTER TABLE ONLY "public"."trade_head"
    ADD CONSTRAINT "public_trade_head_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."trade_body"
    ADD CONSTRAINT "trade_body_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id");

ALTER TABLE ONLY "public"."trade_body"
    ADD CONSTRAINT "trade_body_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "public"."trade_head"("trade_id");

CREATE POLICY "Enable all for authenticated users only" ON "public"."artist" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."artist_payment_status" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."shop" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."trade_body" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."trade_head" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."artist" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."artist_payment_status" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."shop" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."trade_body" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."trade_head" FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."shop" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

ALTER TABLE "public"."artist" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."artist_payment_status" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."shop" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."trade_body" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."trade_head" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_total_trade"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_total_trade"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_total_trade"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_total_trade_with_shop"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "shop_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_total_trade_with_shop"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "shop_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_total_trade_with_shop"("artist_id" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "shop_id" integer) TO "service_role";

GRANT ALL ON TABLE "public"."artist" TO "anon";
GRANT ALL ON TABLE "public"."artist" TO "authenticated";
GRANT ALL ON TABLE "public"."artist" TO "service_role";

GRANT ALL ON SEQUENCE "public"."artist_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."artist_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."artist_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."artist_payment_status" TO "anon";
GRANT ALL ON TABLE "public"."artist_payment_status" TO "authenticated";
GRANT ALL ON TABLE "public"."artist_payment_status" TO "service_role";

GRANT ALL ON SEQUENCE "public"."artist_payment_status_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."artist_payment_status_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."artist_payment_status_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."trade_body" TO "anon";
GRANT ALL ON TABLE "public"."trade_body" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_body" TO "service_role";

GRANT ALL ON TABLE "public"."trade_head" TO "anon";
GRANT ALL ON TABLE "public"."trade_head" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_head" TO "service_role";

GRANT ALL ON TABLE "public"."artist_trade" TO "anon";
GRANT ALL ON TABLE "public"."artist_trade" TO "authenticated";
GRANT ALL ON TABLE "public"."artist_trade" TO "service_role";

GRANT ALL ON TABLE "public"."shop" TO "anon";
GRANT ALL ON TABLE "public"."shop" TO "authenticated";
GRANT ALL ON TABLE "public"."shop" TO "service_role";

GRANT ALL ON TABLE "public"."artist_trade_with_shop" TO "anon";
GRANT ALL ON TABLE "public"."artist_trade_with_shop" TO "authenticated";
GRANT ALL ON TABLE "public"."artist_trade_with_shop" TO "service_role";

GRANT ALL ON SEQUENCE "public"."shop_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shop_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shop_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."trade_body_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trade_body_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trade_body_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;

--
-- Dumped schema changes for auth and storage
--

