<script lang="ts">
	import Toggle4 from '$lib/Component/Toggle4.svelte';
	import type { PaymentStatusRow, PaymentStatusUpdate } from '$lib/db';
	import db from '$lib/db';

	export let paymentStatusRows: PaymentStatusRow;
	export let season: number | null;

	const newUpdate = async (pay: PaymentStatusRow) => {
		var update: PaymentStatusUpdate = {
			artist_id: pay.artist_id,
			season: pay.season,
			state_by_season: pay.state_by_season
		};
		await db.ChangePaymentStatus(update, pay.id);
	};
</script>

<div class="flex flex-col justify-around gap-2 py-2">
	<div class="flex justify-start gap-2 align-baseline">
		<Toggle4
			bind:choosing={paymentStatusRows.state_by_season}
			on:change={async () => {
				await newUpdate(paymentStatusRows);
			}}
		></Toggle4>
	</div>
</div>
