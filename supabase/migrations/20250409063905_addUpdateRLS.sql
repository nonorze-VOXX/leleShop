create policy "Enable update for authenticated users only"
on "public"."artist_alias"
as permissive
for update
to authenticated
using (true)
with check (true);




