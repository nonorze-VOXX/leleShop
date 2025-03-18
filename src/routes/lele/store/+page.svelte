<script lang="ts">
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import InfoBox from '$lib/Component/InfoBox.svelte';
	import { supabase, type StoreRow } from '$lib/db';
	import { onMount } from 'svelte';

	let storeData: StoreRow[] = $state([]);
	onMount(async () => {
		const { data, error } = await supabase.from('store').select('*');
		if (error) {
			console.error(error);
		}
		storeData = data ?? [];
	});
	let newStoreName: string = $state();
	async function updateStoreName(id: number, name: string) {
		const { data, error } = await supabase
			.from('store')
			.update({ store_name: name })
			.eq('id', id)
			.select()
			.single();
		if (error) {
			console.error(error);
			alert(error);
			return;
		}
		if (data) storeData = storeData.map((item) => (item.id === id ? data : item));
	}
	let selectedStoreId: number = $state();
</script>

<h1>店家列表</h1>

{#if storeData}
	<form
		onsubmit={async () => await updateStoreName(selectedStoreId, newStoreName)}
		class="m-2 flex w-fit justify-start gap-4 rounded-lg border-4 border-lele-line p-2 font-bold"
	>
		<select
			bind:value={selectedStoreId}
			required
			class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
		>
			<option value="" disabled selected>Select a store</option>
			{#each storeData as store}
				<option value={store.id}>{store.store_name}</option>
			{/each}
		</select>
		<input
			type="text"
			required
			bind:value={newStoreName}
			placeholder="Enter new name"
			class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
		/>
		<div class="justify-end">(%)</div>
		<button type="submit">
			<InfoBox title={'Update'}></InfoBox>
		</button>
	</form>

	<LeleTable>
		<LeleThead>
			<tr>
				<th scope="col" class="w-auto p-2"> name </th>
			</tr>
		</LeleThead>
		<LeleTbody>
			{#each storeData as store}
				<LeleTbodyTr>
					<td>
						{store.store_name}
					</td>
				</LeleTbodyTr>
			{/each}
		</LeleTbody>
	</LeleTable>
{/if}
