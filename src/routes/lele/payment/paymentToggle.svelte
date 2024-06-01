<script lang="ts">
	import Toggle from '$lib/Component/Toggle.svelte';
	import type { PaymentStatusRow, PaymentStatusUpdate } from '$lib/db';
	import db from '$lib/db';

	export let paymentStatusRows: PaymentStatusRow[];
	export let checked: { [id: number]: boolean };

	const UpdatePaymentStatus = async (
		paymentData: PaymentStatusRow,
		artist_payment_status: {
			artist_id: number | null;
			id: number;
			process_state: 'todo' | 'doing' | 'done' | null;
			year_month: string;
		}[]
	) => {
		if (
			paymentData.year_month === null ||
			paymentData.process_state === null ||
			paymentData.artist_id === null ||
			paymentData.id === null
		) {
			console.log('data error please connect to developer');
			return;
		}
		const state = paymentData.process_state === 'done' ? 'todo' : 'done';
		if (state === 'done') {
			console.log('state = done');
			for (let i = 0; i < artist_payment_status.length; i++) {
				const season = artist_payment_status[i].year_month;
				const process_state = state;
				const artist_id = paymentData.artist_id;
				const payment_id = artist_payment_status[i].id;
				console.log(artist_id, season, process_state, payment_id);
				const update: PaymentStatusUpdate = { artist_id, year_month: season, process_state };
				const { error } = await db.ChangePaymentStatus(update, payment_id);
				if (error) {
					console.error(error);
				} else {
					artist_payment_status[i].process_state = state;
					checked[artist_payment_status[i].id] = true;
				}
				if (artist_payment_status[i].year_month === paymentData.year_month) {
					break;
				}
			}
		} else {
			console.log('state = todo');
			const season = paymentData.year_month;
			const process_state = state;
			const artist_id = paymentData.artist_id;
			const payment_id = paymentData.id;
			const update: PaymentStatusUpdate = { artist_id, year_month: season, process_state };

			const { error } = await db.ChangePaymentStatus(update, payment_id);
			if (error) {
				console.error(error);
			} else {
				paymentData.process_state = state;
				checked[paymentData.id] = false;
			}
		}
	};
</script>

<div class="flex flex-col justify-around gap-2 py-2">
	{#each paymentStatusRows as pay}
		<div class="flex justify-start gap-2 align-baseline">
			<div class="">
				{pay.year_month}
			</div>
			<Toggle
				bind:checked={checked[pay.id]}
				on:change={async () => {
					await UpdatePaymentStatus(pay, paymentStatusRows);
				}}
			></Toggle>
		</div>
	{/each}
</div>
