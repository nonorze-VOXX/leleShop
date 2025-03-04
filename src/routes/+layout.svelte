<script lang="ts">
	import '../app.css';
	import { selectedStore } from '$lib/store/choosing';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/db';
	import type { StoreRow } from '$lib/db';
	import { findIndex } from '$lib/function/Utils';
	import LeleButton from '$lib/Component/LeleStoreButton.svelte';
	let store_list: StoreRow[] = [];
	let selectState: boolean[] = [];
	function UpdateSelectState() {
		store_list.forEach((store, i) => {
			selectState[i] =
				$selectedStore === '*' || $selectedStore.lastIndexOf(store.store_name) !== -1;
		});
	}
	onMount(async () => {
		const { data, error } = await supabase.from('store').select('*');
		if (error) {
			console.error(error);
			return;
		}

		if ($selectedStore !== '*') {
			if (data) {
				// filter exist store
				const store_list = data.map((e) => e.store_name);
				const selectedStoreList = $selectedStore;
				const existStore = selectedStoreList.reduce((acc, cur) => {
					const index = store_list.lastIndexOf(cur);
					if (index !== -1) {
						acc.push(cur);
					}
					return acc;
				}, [] as string[]);
				if (JSON.stringify(selectedStore) !== JSON.stringify(existStore)) {
					selectedStore.set(existStore);
				}
			}
		}

		store_list = data ?? [];
		selectState = new Array(store_list.length).fill(true);
		UpdateSelectState();
	});
</script>

<div class="flex min-h-screen flex-col justify-between bg-lele-bg text-red-950">
	<div class="flex flex-col items-center p-2">
		<div class="h-36 w-36">
			<a href="/">
				<img src="/thecreateicon.png" alt="no icon" />
			</a>
		</div>
		<div class="flex flex-wrap gap-3">
			{#if store_list.length === 0}
				<div>loading...</div>
			{:else}
				{#each store_list as store}
					<LeleButton
						bind:text={store.store_name}
						bind:choosing={selectState[store_list.indexOf(store)]}
						on:click={() => {
							if ($selectedStore === '*') {
								selectedStore.set([store.store_name]);
							} else if (!Array.isArray($selectedStore)) {
								$selectedStore = [];
							} else if ($selectedStore.lastIndexOf(store.store_name) === -1) {
								selectedStore.set([...$selectedStore, store.store_name]);
							} else {
								// remmove from list
								const index = findIndex($selectedStore, store.store_name);
								if (index !== -1) {
									const newSelectedStore = [...$selectedStore];
									newSelectedStore.splice(index, 1);
									selectedStore.set(newSelectedStore);
								}
							}
							UpdateSelectState();
						}}
					></LeleButton>
				{/each}
			{/if}
		</div>
		<div class="w-full p-4 lg:w-3/4 xl:w-3/4">
			<slot />
		</div>
	</div>
	<footer>
		<div class=" w-full bg-lele-line p-4 text-center font-semibold text-lele-bg">
			這個網頁還在開發中，僅供參考 如果有bug 或是想要新功能 請回報給管理員
		</div>
	</footer>
</div>
