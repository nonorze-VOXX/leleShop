<script lang="ts">
	import { goto } from '$app/navigation';
	import { TabEnum } from './Menu';
	import MenuButton from './MenuButton.svelte';

	let tabType: TabEnum = $state(TabEnum.artist_list);
</script>

<div class="flex justify-start gap-2 overflow-auto p-2">
	<MenuButton
		label="Artist List"
		onclick={() => {
			tabType = TabEnum.artist_list;
			goto('/lele/artistList');
		}}
	/>
	<MenuButton
		label="Manage Key"
		onclick={() => {
			tabType = TabEnum.report_key;
			goto('/lele/reportKey');
		}}
	/>
	<MenuButton
		label="Import"
		onclick={() => {
			tabType = TabEnum.import;
			goto('/lele/import');
		}}
	/>
	<MenuButton
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
		label="Artist Commission"
		onclick={() => {
			tabType = TabEnum.artist_commission;
			goto('/lele/artistCommission');
		}}
	/>
	<MenuButton
		label="Artist Alias"
		onclick={() => {
			tabType = TabEnum.artist_alias;
			goto('/lele/alias');
		}}
	/>
</div>
