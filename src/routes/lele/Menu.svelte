<script lang="ts">
	import { goto } from '$app/navigation';

	enum TabEnum {
		artist_list,
		report_key,
		payment,
		total,
		import
	}
	let tabType: TabEnum = TabEnum.artist_list;
</script>

<div class="flex justify-start gap-2 overflow-auto p-2">
	<button
		on:click={() => {
			tabType = TabEnum.artist_list;
			goto('/lele/artistList');
		}}
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg">Artist List</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => {
			tabType = TabEnum.report_key;
			goto('/lele/reportKey');
		}}>Manage Key</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => {
			tabType = TabEnum.payment;
			goto('/lele/payment');
		}}>payment</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => {
			tabType = TabEnum.import;
			goto('/lele/import');
		}}>import</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => {
			tabType = TabEnum.total;
			goto('/lele/totalPage');
		}}>Total</button
	>
</div>
