<script lang="ts">
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';
	import PaymentToggle from './paymentToggle.svelte';
	import { supabase, type ArtistRow } from '$lib/db';

	let seasonPaymentDataList: ArtistRow[] = [];

	onMount(async () => {
		const { data, error } = await supabase.from('artist').select('*').order('id');
		if (error) {
			console.error(error);
		} else {
			seasonPaymentDataList = data;
		}
	});
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-40 p-2"> 品牌 </th>
			<th scope="col" class="w-20 p-2"> state</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if seasonPaymentDataList}
			{#each seasonPaymentDataList as p}
				<LeleTbodyTr>
					<td class="p-2">
						{p.artist_name}
					</td>
					<td>
						<PaymentToggle bind:artistRow={p}></PaymentToggle>
					</td>
				</LeleTbodyTr>
			{/each}
		{:else}
			amogus
		{/if}
	</LeleTbody>
</LeleTable>
