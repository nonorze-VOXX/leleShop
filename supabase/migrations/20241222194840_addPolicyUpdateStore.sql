create policy "Enable update for authenticated users only"
on "public"."store"
as permissive
for update
to authenticated
using (true);




