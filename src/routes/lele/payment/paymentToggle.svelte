<script lang="ts">
	import Toggle4 from '$lib/Component/Toggle4.svelte';
	import { supabase, type ArtistRow, type ArtistUpdate } from '$lib/db';

	export let artistRow: ArtistRow;

	const newUpdate = async (pay: ArtistRow) => {
		var update: ArtistUpdate = {
			payment: pay.payment
		};
		const { error } = await supabase.from('artist').update(update).eq('id', pay.id);
		if (error) {
			console.error(error);
		}
	};
</script>

<div class="flex flex-col justify-around gap-2 py-2">
	<div class="flex justify-start gap-2 align-baseline">
		<Toggle4
			bind:choosing={artistRow.payment}
			on:change={async () => {
				await newUpdate(artistRow);
			}}
		></Toggle4>
	</div>
</div>
