<script lang="ts">
	import { goto } from '$app/navigation';
	import MenuButton from './MenuButton.svelte';

	enum TabEnum {
		artist_list,
		report_key,
		payment,
		total,
		import,
		// store,
		artist_commission
	}
	let tabType: TabEnum = TabEnum.artist_list;
</script>

<div class="flex justify-start gap-2 overflow-auto p-2">
	<MenuButton
		label="Artist List"
		on:click={() => {
			tabType = TabEnum.artist_list;
			goto('/lele/artistList');
		}}
	/>
	<MenuButton
		label="Manage Key"
		on:click={() => {
			tabType = TabEnum.report_key;
			goto('/lele/reportKey');
		}}
	/>
	<MenuButton
		label="Payment"
		on:click={() => {
			tabType = TabEnum.payment;
			goto('/lele/payment');
		}}
	/>
	<MenuButton
		label="Import"
		on:click={() => {
			tabType = TabEnum.import;
			goto('/lele/import');
		}}
	/>
	<MenuButton
		label="Total"
		on:click={() => {
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
		on:click={() => {
			tabType = TabEnum.artist_commission;
			goto('/lele/artistCommission');
		}}
	/>
</div>
