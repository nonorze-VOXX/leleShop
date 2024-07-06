<script lang="ts">
	import type { PaymentStatusRow } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';
	import db from '$lib/db';
	import PaymentToggle from './paymentToggle.svelte';
	import { GetSeason } from '$lib/function/Utils';

	let seasonPaymentDataList: {
		prevSeason: {
			id: number;
			artist_name: string | null;
			visible: boolean;
			artist_payment_status: PaymentStatusRow;
		};
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
		};
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
			season: season.prevSeason
		});
		for (let i = 0; i < result.data.length; i++) {
			seasonPaymentDataList.push({
				nowSeason: result.data[i],
				prevSeason: prevResult.data[i],
				nextSeason: nextResult.data[i]
			});
		}
		console.log(seasonPaymentDataList);
		seasonPaymentDataList = seasonPaymentDataList;
	});
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
							<PaymentToggle
								bind:season={p.prevSeason.artist_payment_status.state_by_season}
								bind:paymentStatusRows={p.prevSeason.artist_payment_status}
							></PaymentToggle>
						</td>
						<td>
							<PaymentToggle
								bind:season={p.nowSeason.artist_payment_status.state_by_season}
								bind:paymentStatusRows={p.nowSeason.artist_payment_status}
							></PaymentToggle>
						</td>
						<td>
							<PaymentToggle
								bind:season={p.nextSeason.artist_payment_status.state_by_season}
								bind:paymentStatusRows={p.nextSeason.artist_payment_status}
							></PaymentToggle>
						</td>
					</LeleTbodyTr>
				{/each}
			{:else}
				amogus
			{/if}
		</LeleTbody>
	</LeleTable>
{/if}
