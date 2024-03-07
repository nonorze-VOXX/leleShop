drop policy "Enable all for authenticated users only" on "public"."artist";

create policy "Enable all for authenticated users only"
on "public"."artist"
as permissive
for all
to authenticated
using (true)
with check (true);




