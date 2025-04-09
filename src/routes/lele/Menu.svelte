<script lang="ts">
	import { goto } from '$app/navigation';
	import { TabEnum } from './Menu';
	import MenuButton from './MenuButton.svelte';

	let tabType: TabEnum = $state(TabEnum.artist_list);
</script>

<div class="flex justify-start gap-2 overflow-auto p-2">
	<MenuButton
		choosing={tabType === TabEnum.artist_list}
		label="Artist List"
		onclick={() => {
			tabType = TabEnum.artist_list;
			goto('/lele/artistList');
		}}
	/>
	<MenuButton
		choosing={tabType === TabEnum.report_key}
		label="Manage Key"
		onclick={() => {
			tabType = TabEnum.report_key;
			goto('/lele/reportKey');
		}}
	/>
	<MenuButton
		choosing={tabType === TabEnum.import}
		label="Import"
		onclick={() => {
			tabType = TabEnum.import;
			goto('/lele/import');
		}}
	/>
	<MenuButton
		choosing={tabType === TabEnum.total}
		label="Total"
		onclick={() => {
			tabType = TabEnum.total;
			goto('/lele/totalPage');
		}}
	/>
	<!-- <MenuButton
		label="Store"
		on:click={() => {
			tabType = TabEnum.store;
			goto('/lele/store');
		}}
	/> -->
	<MenuButton
		choosing={tabType === TabEnum.artist_commission}
		label="Artist Commission"
		onclick={() => {
			tabType = TabEnum.artist_commission;
			goto('/lele/artistCommission');
		}}
	/>
	<MenuButton
		choosing={tabType === TabEnum.artist_alias}
		label="Artist Alias"
		onclick={() => {
			tabType = TabEnum.artist_alias;
			goto('/lele/alias');
		}}
	/>
</div>
