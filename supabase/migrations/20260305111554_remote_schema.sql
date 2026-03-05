drop extension if exists "pg_net";

CREATE INDEX idx_artist_id ON public.trade_body USING btree (artist_id);

drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";

drop trigger if exists "objects_insert_create_prefix" on "storage"."objects";

drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'storage' and table_name = 'prefixes'
  ) then
    drop trigger if exists "prefixes_create_hierarchy" on "storage"."prefixes";
    drop trigger if exists "prefixes_delete_hierarchy" on "storage"."prefixes";
  end if;
end $$;

drop trigger if exists protect_buckets_delete on storage.buckets;

drop trigger if exists protect_objects_delete on storage.objects;

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


