<script lang="ts">
	import { ProcessFile } from './importFunction';
	import { ProcessedStatus } from './importBase';

	let newTradeHeadCount: number = $state(0);
	let newTradeBodyCount: number = $state(0);
	let susTrade: string[] = $state([]);
	let processed: ProcessedStatus = $state(ProcessedStatus.NORMAL);
	let submitLog: string = $state('');
	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
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
		newTradeHeadCount = 0;
		newTradeBodyCount = 0;
		for (let i = 0; i < fs.length; i++) {
			await ProcessFile(fs[i])
				.then(({ newHeadCount, newBodyCount, susTradeIdList }) => {
					processed = ProcessedStatus.PROCESSED;
					newTradeBodyCount += newBodyCount;
					newTradeHeadCount += newHeadCount;
					susTrade = susTradeIdList;
				})
				.catch((e) => {
					processed = ProcessedStatus.ERROR;
					submitLog = e.toString();
					alert('Error: ' + e.toString());
				});
		}
	}
</script>

<div
	class="flex flex-col items-center rounded-xl border-4 border-lele-line bg-lele-bg p-5 font-bold"
>
	<form onsubmit={handleSubmit} class="flex w-full flex-col items-center gap-4 text-lg">
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
	<div class="p-2"></div>
	<div class="flex w-full flex-col border-t-2 border-lele-line pt-2">
		<div class="text-center">共{newTradeHeadCount}筆新交易</div>
		<div class="text-center">賣出{newTradeBodyCount}次商品</div>

		{#if susTrade.length > 0}
			<div class="text-center">以下交易序號不是關閉狀態</div>
			<div class="inline gap-4">
				<p>交易序號：{susTrade.reduce((acc, tradeId) => acc + tradeId + ', ', '')}</p>
				<!-- {#each susTrade as tradeId} -->
				<!-- <div class="inline text-lg">{tradeId}</div> -->
				<!-- {/each} -->
			</div>
		{/if}
	</div>
</div>
