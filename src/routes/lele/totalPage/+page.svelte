<script lang="ts">
	import { onMount } from 'svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import { GetTradeTotalDataEachOne } from './totalPage';
	import {
		FormatNumberToTwoDigi,
		GetAllMonth,
		NextMonthFirstDate,
		ThisMonthFirstDate
	} from '$lib/function/Utils';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import MonthTab from '$lib/Component/MonthTab.svelte';
	import type { ShopRow } from '$lib/db';
	import db from '$lib/db';
	import { page } from '$app/stores';
	import ShopChooser from '$lib/Component/ShopChooser.svelte';
	import { goto } from '$app/navigation';

	let totalData: {
		artist_name: string;
		net_total: number;
	}[] = [];

	let realTotal: number[] = [];
	let totalData90: number[] = [];

	let sumTotalData: {
		real_sales_sum: number;
		real_sales_90_sum: number;
	};
	let shop_id: number | '*' = '*';
	let shopList: ShopRow[] = [];
	let commission: number | null = null;
	let dateRange: { firstDate: Date; lastDate: Date };
	onMount(async () => {
		const { data } = await db.GetShopList();
		shopList = data ?? [];
		let paramId = $page.url.searchParams.get('shop_id');
		if (paramId === null) {
			shop_id = '*';
			commission = null;
		} else {
			shop_id = parseInt(paramId);
			commission = shopList.find((e) => e.id == shop_id)?.commission ?? null;
		}
		dateRange = { firstDate: ThisMonthFirstDate(-1), lastDate: NextMonthFirstDate(-1) };
		await FetchData(dateRange.firstDate, dateRange.lastDate, shop_id);
	});
	let showedMonth: string;
	const FetchData = async (firstDate: Date, lastDate: Date, shop_id: number | '*') => {
		const { result, error } = await GetTradeTotalDataEachOne(firstDate, lastDate, shop_id);
		showedMonth = FormatNumberToTwoDigi((firstDate.getMonth() + 1).toString());
		if (error) {
			console.error(error);
			return;
		}
		realTotal = [];
		totalData90 = [];
		totalData = result;
		result.map((data) => {
			realTotal.push(data.net_total);
			totalData90.push(Math.ceil(data.net_total * 0.9));
		});
		sumTotalData = {
			real_sales_sum: realTotal.reduce((a, b) => a + b, 0),
			real_sales_90_sum: totalData90.reduce((a, b) => a + b, 0)
		};
	};

	let tabDataList: string[] = GetAllMonth();
	const ClickTab = async (tabData: string) => {
		showedMonth = tabData;
		const date = new Date();
		let firstDay = new Date(date.getFullYear(), parseInt(tabData) - 1, 1);
		let lastDay = new Date(date.getFullYear(), parseInt(tabData), 1);
		dateRange = { firstDate: firstDay, lastDate: lastDay };
		await FetchData(firstDay, lastDay, shop_id);
	};

	async function handleShopChange(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const formData = new FormData(event.currentTarget);
		const param = new URLSearchParams($page.url.searchParams);
		const id = formData.get('shops') as string;
		if (id === '*') {
			param.delete('shop_id');
			shop_id = '*';
		} else {
			param.set('shop_id', id);
			shop_id = parseInt(id);
		}
		commission =
			shopList.find((e) => e.id == parseInt(formData.get('shops') as string))?.commission ?? null;
		await FetchData(dateRange.firstDate, dateRange.lastDate, shop_id);
		goto(`?${param.toString()}`);
	}
</script>

<form on:change|preventDefault={handleShopChange} class="flex flex-col items-center gap-4 text-lg">
	<ShopChooser bind:shop_id bind:shopList></ShopChooser>
</form>
{#if showedMonth}
	<MonthTab
		bind:tabDataList
		bind:showedMonth
		on:onTabChange={async (e) => {
			await ClickTab(e.detail.showedMonth);
		}}
	></MonthTab>
{/if}
<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2">name</th>
			<th scope="col" class="w-20 p-2">Total</th>
			<th scope="col" class="w-20 p-2">90%</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if sumTotalData}
			<LeleTbodyTr>
				<td class="p-2"> TOTAL</td>
				<td class="p-2">{sumTotalData.real_sales_sum}</td>
				<td class="p-2">{sumTotalData.real_sales_90_sum}</td>
			</LeleTbodyTr>
		{/if}
		{#each totalData as data, index}
			<LeleTbodyTr>
				<td class="p-2">{data.artist_name}</td>
				<td class="p-2">{realTotal[index]}</td>
				<td class="p-2">
					{totalData90[index]}
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
