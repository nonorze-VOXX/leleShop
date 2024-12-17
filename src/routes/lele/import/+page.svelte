<script lang="ts">
	import type { TradeBodyRow, TradeHeadRow } from '$lib/db';
	import { ProcessFile } from './importFunction';
	enum ProcessedStatus {
		NORMAL,
		PROCESSING,
		ERROR,
		PROCESSED
	}

	let newTradeHeadList: TradeHeadRow[] = [];
	let newTradeBodyList: TradeBodyRow[] = [];
	let susTrade: string[] = [];
	let processed: ProcessedStatus = ProcessedStatus.NORMAL;
	let submitLog: string = '';
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const formData = new FormData(event.currentTarget);
		processed = ProcessedStatus.PROCESSING;

		// const newF = async (formData: FormData) => {
		const files = formData.getAll('fileToUpload');
		if (files.length === 0) {
			return { error: 'You must provide a file to upload' };
		}

		const fs = files.map((e) => {
			return e as File;
		});
		for (let i = 0; i < fs.length; i++) {
			await ProcessFile(fs[i])
				.then(() => {
					processed = ProcessedStatus.PROCESSED;
					// todo : show imported data
				})
				.catch((e) => {
					processed = ProcessedStatus.ERROR;
					submitLog = e.toString();
					console.error(e);
				});
		}
	}
</script>

<div class="flex flex-col items-center rounded-xl border-4 border-lele-line bg-lele-bg p-5">
	<form on:submit|preventDefault={handleSubmit} class="flex flex-col items-center gap-4 text-lg">
		<div>
			<!-- <label for="file">Upload your file</label> -->
			<input multiple type="file" id="file" name="fileToUpload" accept=".csv" required />
		</div>

		<button class="w-fit rounded-full bg-green-600 px-3 font-bold text-white" type="submit"
			>Submit</button
		>
	</form>

	{#if processed === ProcessedStatus.PROCESSING}
		<p class="text-7xl">Processing...</p>
	{:else if processed === ProcessedStatus.PROCESSED}
		<p class="text-7xl">DONE</p>
	{:else if processed === ProcessedStatus.ERROR}
		<p class="text-7xl text-red-600">{submitLog}</p>
	{/if}
	<div class="flex flex-col">
		<div class="text-center">共{newTradeHeadList.length}筆新交易</div>
		<div class="text-center">賣出{newTradeBodyList.length}次商品</div>

		{#if susTrade.length > 0}
			<div class="text-center">以下交易序號不是關閉狀態</div>
			{#each susTrade as tradeId}
				<div class="flex justify-start gap-4 text-lg">
					<div>交易序號：{tradeId}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
