
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

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL
);

ALTER TABLE "public"."countries" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."countries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."countries_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."countries_id_seq" OWNED BY "public"."countries"."id";

CREATE TABLE IF NOT EXISTS "public"."trade_body" (
    "id" bigint NOT NULL,
    "trade_id" text,
    "artist_name" text,
    "item_name" text,
    "quantity" integer,
    "total_sales" numeric,
    "discount" numeric,
    "net_sales" numeric
);

ALTER TABLE "public"."trade_body" OWNER TO "postgres";

ALTER TABLE "public"."trade_body" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."trade_body_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."trade_head" (
    "trade_date" timestamp with time zone,
    "trade_id" text NOT NULL,
    "state" text
);

ALTER TABLE "public"."trade_head" OWNER TO "postgres";

ALTER TABLE ONLY "public"."countries" ALTER COLUMN "id" SET DEFAULT nextval('public.countries_id_seq'::regclass);

ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."trade_body"
    ADD CONSTRAINT "trade_body_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."trade_head"
    ADD CONSTRAINT "trade_head_pkey" PRIMARY KEY ("trade_id");

ALTER TABLE ONLY "public"."trade_body"
    ADD CONSTRAINT "trade_body_trade_id_fkey" FOREIGN KEY (trade_id) REFERENCES public.trade_head(trade_id);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."countries" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."trade_body" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."trade_head" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."countries" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."trade_body" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."trade_head" FOR SELECT USING (true);

ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."trade_body" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."trade_head" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";

GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."trade_body" TO "anon";
GRANT ALL ON TABLE "public"."trade_body" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_body" TO "service_role";

GRANT ALL ON SEQUENCE "public"."trade_body_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trade_body_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trade_body_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."trade_head" TO "anon";
GRANT ALL ON TABLE "public"."trade_head" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_head" TO "service_role";

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
