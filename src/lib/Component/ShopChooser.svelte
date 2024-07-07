<script lang="ts">
	import type { ShopRow } from '$lib/db';

	export let shopList: ShopRow[] = [];
	export let shop_id: number | '*' | null;
</script>

<div>
	<label for="shops">Choose Shop:</label>

	<select name="shops" id="shops" class="p-2" bind:value={shop_id}>
		<option value={'*'}>All</option>
		{#each shopList as shop}
			<option value={shop.id}>{shop.shop_name}</option>
		{/each}
	</select>
</div>
