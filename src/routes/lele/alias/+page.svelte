<script lang="ts">
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import Toggle from '$lib/Component/Toggle.svelte';
	import { supabase, type ArtistAliasMapRow, type ArtistWithTradeRow } from '$lib/db';
	import { onMount } from 'svelte';

	let aliasList: ArtistAliasMapRow[] = $state([]);
	let LogForUser = $state('');
	let edit = $state(false);
	let filterText = $state('');
	let showedAliasList: ArtistAliasMapRow[] = $derived.by(() => {
		if (filterText.trim() === '')
			return [...aliasList].sort((a, b) => {
				if (a.artist_alias === null) return -1;
				if (b.artist_alias === null) return 1;
				if (a.artist_alias < b.artist_alias) return -1;
				if (a.artist_alias > b.artist_alias) return 1;
				return 0;
			});
		const processedFilter = filterText
			.trim()
			.split(' ')
			.map((s) => s.trim());
		return [...aliasList]
			.filter((d) =>
				processedFilter.reduce((pre, cur) => pre || JSON.stringify(d).match(cur) !== null, false)
			)
			.sort();
	});
	const UpdateAliasList = async () => {
		const { data, error } = await supabase.from('artist_alias_map').select('*');
		if (error) {
			// console.log(error.message);
			LogForUser = error.message;
		} else {
			aliasList = data;
		}
	};
	onMount(async () => {
		await UpdateAliasList();
	});
	let modify: ArtistWithTradeRow[] = $state([]);
	let modifyFunction: () => Promise<void>;
	let modifyLog: () => string;
	const createModifyFunction = (beforeId: number, afterId: number) => {
		return async () => {
			const { error } = await supabase
				.from('trade_body')
				.update({ artist_id: afterId })
				.eq('artist_id', beforeId)
				.select();
			if (error) {
				LogForUser = error.message;
				return;
			}

			const { error: error2 } = await supabase
				.from('artist_alias')
				.update({ artist_id: afterId })
				.eq('artist_id', beforeId);
			if (error2) {
				LogForUser = error2.message;
				return;
			}
			const { error: error3 } = await supabase.from('artist').delete().eq('id', beforeId);
			if (error3) {
				LogForUser = error3.message;
				return;
			}
			const { error: error4, data } = await supabase.from('artist_alias_map').select('*');
			if (error4) {
				LogForUser = error4.message;
				return;
			}
			aliasList = data ?? [];
		};
	};
</script>

<div class="flex flex-wrap gap-2 text-lg font-bold">
	<h2>filter</h2>
	<input
		class="w-60 rounded-md border-4 border-lele-line px-1 sm:w-80"
		type="text"
		bind:value={filterText}
	/>
</div>
<div class="p-2 font-semibold text-lele-line">
	edit: <Toggle bind:checked={edit}></Toggle>
</div>
{#if !edit}
	<div class="flex">
		<LeleTable>
			<LeleThead>
				<tr>
					<th> 暱稱 </th>
					<th> 顯示名稱 </th>
				</tr>
			</LeleThead>
			<LeleTbody>
				{#each showedAliasList as alias}
					{#if alias.artist_alias !== alias.artist_name}
						<LeleTbodyTr>
							<td>
								{alias.artist_alias}
							</td>
							<td>
								{alias.artist_name}
							</td>
						</LeleTbodyTr>
					{/if}
				{/each}
			</LeleTbody>
		</LeleTable>
		<div></div>
	</div>
{:else}
	<div class="w-fit rounded-xl border-2 border-lele-line px-2 font-semibold text-lele-line">
		提示：合併後 左邊的商店頁面會消失，右邊會留下
	</div>
	<div class="flex py-2">
		<form
			onsubmit={async (e) => {
				e.preventDefault();
				const before = e.currentTarget.beforeName.value;
				const after = e.currentTarget.afterName.value;
				if (before === after) {
					LogForUser = 'before and after are the same';
					return;
				}
				const beforeId = aliasList.find((alias) => alias.artist_alias === before)?.id;
				const afterId = aliasList.find((alias) => alias.artist_alias === after)?.id;
				if (beforeId === undefined || afterId === undefined) return;
				if (beforeId === null || afterId === null) return;
				if (beforeId === afterId) {
					LogForUser = 'before and after are the same';
					return;
				}
				const { data, error } = await supabase
					.from('artist_trade')
					.select('*')
					.eq('artist_id', beforeId);
				if (error) {
					LogForUser = error.message;
					return;
				}
				modify = data ?? [];
				modifyFunction = createModifyFunction(beforeId, afterId);
				modifyLog = () => {
					return before + ' -> ' + after;
				};
			}}
			class="flex flex-wrap gap-2"
		>
			<select
				name="beforeName"
				id="beforeName"
				class=" h-fit rounded-lg border-lele-line bg-lele-line p-2 font-semibold text-lele-bg"
			>
				{#each showedAliasList as alias}
					<option value={alias.artist_alias}>{alias.artist_alias}</option>
				{/each}
			</select>
			<div class="h-fit content-center text-center font-semibold text-lele-line">{'=>'}</div>
			<select
				name="afterName"
				id="afterName"
				class=" rounded-lg border-lele-line bg-lele-line p-2 font-semibold text-lele-bg"
			>
				{#each showedAliasList as alias}
					<option value={alias.artist_name}>{alias.artist_name}</option>
				{/each}
			</select>
			<input
				type="submit"
				value="Submit"
				class=" rounded-lg border-lele-line bg-lele-line p-2 font-semibold text-lele-bg"
			/>
		</form>
	</div>
	{#if LogForUser}
		<div class="w-fit rounded-xl border-2 border-lele-line px-2 font-semibold text-lele-line">
			{LogForUser}
		</div>
	{/if}
	{#if modify.length > 0}
		<div class="my-2 rounded-lg border-2 border-lele-line bg-lele-bg p-2">
			<input
				type="button"
				value="OK!"
				onclick={async () => {
					modifyFunction().then(() => (LogForUser = modifyLog() + ' rename OK!'));
					modify = [];
				}}
				class=" rounded-lg border-lele-line bg-lele-line p-2 font-semibold text-lele-bg"
			/>
			<div class="font-semibold text-lele-line">will changed:</div>
			{#each modify as m}
				<div>
					{m.trade_id}
				</div>
			{/each}
		</div>
	{/if}
{/if}
