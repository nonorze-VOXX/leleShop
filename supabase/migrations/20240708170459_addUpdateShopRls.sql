create policy "Enable update for authenticated users only"
on "public"."shop"
as permissive
for update
to authenticated
using (true)
with check (true);




