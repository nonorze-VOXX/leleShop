create policy "anon can update todo to doing"
on "public"."artist_payment_status"
as permissive
for update
to anon
using ((process_state = 'todo'::processenum))
with check ((process_state = 'doing'::processenum));




