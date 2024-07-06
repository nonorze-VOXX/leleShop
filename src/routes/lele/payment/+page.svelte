<script lang="ts">
	import type { PaymentStatusRow } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';
	import db, { supabase } from '$lib/db';
	import PaymentToggle from './paymentToggle.svelte';
	import { GetSeason } from '$lib/function/Utils';
	import { invalidate, invalidateAll } from '$app/navigation';

	let seasonPaymentDataList: {
		prevSeason: {
			id: number;
			artist_name: string | null;
			visible: boolean;
			artist_payment_status: PaymentStatusRow;
		} | null;
		nowSeason: {
			id: number;
			artist_name: string | null;
			visible: boolean;
			artist_payment_status: PaymentStatusRow;
		};
		nextSeason: {
			id: number;
			artist_name: string | null;
			visible: boolean;
			artist_payment_status: PaymentStatusRow;
		} | null;
	}[] = [];
	var season: { nowSeason: number; prevSeason: number; nextSeason: number };

	onMount(async () => {
		var date = new Date();
		const nowSeason = GetSeason(date);
		season = { nowSeason, prevSeason: nowSeason - 1, nextSeason: nowSeason + 1 };
		const result = await db.GetArtistDataWithPaymentStatus({
			visible: null,
			season: season.nowSeason
		});
		const prevResult = await db.GetArtistDataWithPaymentStatus({
			visible: null,
			season: season.prevSeason
		});
		const nextResult = await db.GetArtistDataWithPaymentStatus({
			visible: null,
			season: season.nextSeason
		});

		await PreInsertPaymentStatus();

		for (let i = 0; i < result.data.length; i++) {
			seasonPaymentDataList.push({
				nowSeason: result.data[i],
				prevSeason: prevResult.data.find((e) => e.id === result.data[i].id) ?? null,

				nextSeason: nextResult.data.find((e) => e.id === result.data[i].id) ?? null
			});
		}
		seasonPaymentDataList = seasonPaymentDataList;
	});
	async function PreInsertPaymentStatus() {
		const {
			count: paymentCount,
			data: paymentData,
			error: paymentError
		} = await supabase
			.from('artist_payment_status')
			.select('*', { count: 'exact', head: false })
			.eq('season', season.nextSeason);
		if (paymentError) {
			console.log(paymentError);
		}
		if (paymentCount === 0) {
			const { data, error: artistError } = await supabase.from('artist').select('id');
			if (artistError) {
				console.log(artistError);
			}
			const artistData = data ?? [];
			const { data: insertData, error } = await supabase
				.from('artist_payment_status')
				.insert(
					artistData.map((artist) => {
						return {
							artist_id: artist.id,
							season: season.nextSeason,
							state_by_season: 0
						};
					})
				)
				.select();
			if (error) {
				console.error(error);
			}
			await invalidateAll();
		} else {
			const {
				data: artistData,
				count: artistCount,
				error: artistError
			} = await supabase.from('artist').select('id', { count: 'exact', head: false });
			if (artistError) {
				console.log(artistError);
			}
			console.log(artistCount, paymentCount);
			if (artistCount !== paymentCount) {
				const data = artistData ?? [];
				const { data: insertData, error } = await supabase
					.from('artist_payment_status')
					.insert(
						data
							.filter((e) => !paymentData?.some(({ artist_id }) => e.id === artist_id))
							.map((artist) => {
								return {
									artist_id: artist.id,
									season: season.nextSeason,
									state_by_season: 0
								};
							})
					)
					.select();
				if (error) {
					console.error(error);
				}
				await invalidateAll();
			}
		}
	}
</script>

{#if season}
	<div class="font-semibold">hint: S1(2024/02 ~ 2024/04)</div>
	<LeleTable>
		<LeleThead>
			<tr>
				<th scope="col" class="w-40 p-2"> 品牌 </th>
				<th scope="col" class="w-20 p-2"> S{season.prevSeason}</th>
				<th scope="col" class="w-20 p-2"> S{season.nowSeason}</th>
				<th scope="col" class="w-20 p-2"> S{season.nextSeason}</th>
			</tr>
		</LeleThead>
		<LeleTbody>
			{#if seasonPaymentDataList.length !== 0}
				{#each seasonPaymentDataList as p, index}
					<LeleTbodyTr>
						<td class="p-2">
							{p.nowSeason.artist_name}
						</td>
						<td>
							{#if p.prevSeason}
								<PaymentToggle
									bind:season={p.prevSeason.artist_payment_status.state_by_season}
									bind:paymentStatusRows={p.prevSeason.artist_payment_status}
								></PaymentToggle>
							{/if}
						</td>
						<td>
							<PaymentToggle
								bind:season={p.nowSeason.artist_payment_status.state_by_season}
								bind:paymentStatusRows={p.nowSeason.artist_payment_status}
							></PaymentToggle>
						</td>
						<td>
							{#if p.nextSeason}
								<PaymentToggle
									bind:season={p.nextSeason.artist_payment_status.state_by_season}
									bind:paymentStatusRows={p.nextSeason.artist_payment_status}
								></PaymentToggle>
							{/if}
						</td>
					</LeleTbodyTr>
				{/each}
			{:else}
				amogus
			{/if}
		</LeleTbody>
	</LeleTable>
{/if}
