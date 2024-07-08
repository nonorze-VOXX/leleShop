<script lang="ts">
	import { LeleTable, LeleTbody, LeleTbodyTr, LeleThead } from '$lib/Component/htmlWrapper';
	import { supabase, type ShopInsert, type ShopRow, type ShopUpdate } from '$lib/db';
	import { onMount } from 'svelte';

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const formData = new FormData(event.currentTarget);
		const commision = formData.get('commission') as string;
		console.log(formData);
		if (commision === null) {
			return;
		}
		const shopData: ShopInsert = {
			commission: parseFloat(commision),
			shop_name: formData.get('shop_name') as string
		};
		const { error } = await supabase.from('shop').insert(shopData);
		if (error) {
			console.error(error);
			return;
		}
	}
	let shopList: ShopRow[] = [];
	onMount(async () => {
		const { data, error } = await supabase.from('shop').select('*');
		if (error) {
			console.error(error);
			return;
		}
		shopList = data;
	});
	async function handleShopUpdate(
		event: { currentTarget: EventTarget & HTMLFormElement },
		originalData: ShopRow
	) {
		const formData = new FormData(event.currentTarget);
		const newName = formData.get('shop_name') as string;
		const newData: ShopUpdate = {};
		if (newName && newName !== originalData.shop_name) {
			newData.shop_name = newName;
		}

		const newCommissionStr = formData.get('commission')?.toString();
		if (newCommissionStr && newCommissionStr !== originalData.commission.toString()) {
			newData.commission = parseFloat(newCommissionStr);
		}
		if (Object.keys(newData).length === 0) {
			return;
		}
		const { error } = await supabase
			.from('shop')
			.update(newData)
			.eq('id', originalData.id)
			.select();
		if (error) {
			console.error(error);
			return;
		}
	}
</script>

<div class="flex flex-col items-center gap-2">
	<form
		on:submit|preventDefault={handleSubmit}
		method="post"
		class="flex flex-col items-center gap-4 rounded-xl bg-lele-line p-3 text-base font-semibold text-lele-bg
        "
	>
		<div>Add shop</div>
		<div class="flex w-full justify-between gap-3">
			<label for="name">name</label>
			<input type="text" id="name" name="shop_name" class="w-60 text-lele-line" required />
		</div>
		<div class="flex w-full justify-between gap-3">
			<label for="commission">抽成(%)</label>
			<input type="number" id="commission" required class="w-60 text-lele-line" name="commission" />
		</div>
		<button type="submit" class="rounded-full bg-lele-bg px-2 text-lele-line">add</button>
	</form>

	<div class="flex w-80">
		<LeleTable>
			<LeleThead>
				<tr>
					<td>店名</td>
					<td class="w-20">抽成(%)</td>
				</tr>
			</LeleThead>
			<LeleTbody>
				{#each shopList as shop}
					<LeleTbodyTr>
						<td>
							<form
								on:submit|preventDefault={async (e) => {
									await handleShopUpdate(e, shop);
								}}
							>
								<input
									class=" w-1/2 bg-lele-bg focus:bg-gray-400 focus:text-white"
									type="text"
									name="shop_name"
									value={shop.shop_name}
								/>
								<button type="submit">V</button>
							</form>
						</td>
						<td>
							<form
								on:submit|preventDefault={async (e) => {
									await handleShopUpdate(e, shop);
								}}
							>
								<input
									class=" w-1/2 bg-lele-bg focus:bg-gray-400 focus:text-white"
									type="number"
									name="commission"
									value={shop.commission}
									min="0"
									max="100"
								/>
								<button type="submit">V</button>
							</form>
						</td>
					</LeleTbodyTr>
				{/each}
			</LeleTbody>
		</LeleTable>
	</div>
</div>
