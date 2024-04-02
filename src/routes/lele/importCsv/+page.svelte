<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	enum ProcessedStatus {
		NORMAL,
		PROCESSING,
		LOGIN_FAILED,
		PROCESSED
	}
	const timeZoneOffsetToHHMM = (timeZoneOffset: number) => {
		const sign = timeZoneOffset < 0 ? '+' : '-';
		const abs = Math.abs(timeZoneOffset);
		const hour = Math.floor(abs / 60);
		const minute = abs % 60;
		return sign + (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
	};
	let tableData: string[][];
	let processed: ProcessedStatus = ProcessedStatus.NORMAL;
	// let submitLog: string = '';
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		data.append('dateOffset', timeZoneOffsetToHHMM(new Date().getTimezoneOffset()));

		processed = ProcessedStatus.PROCESSING;
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		const result: ActionResult = deserialize(await response.text());
		console.log(result);

		if (result.type === 'success') {
			// submitLog = result.data?.error;
			console.log(result.data);

			processed = ProcessedStatus.PROCESSED;
			await invalidateAll();
		} else if (result.type === 'failure') {
			processed = ProcessedStatus.LOGIN_FAILED;
			console.log(result.data?.message);
		} else if (result.type === 'redirect') {
			goto(result.location);
		}

		applyAction(result);
	}
</script>

<div class="flex h-screen flex-col justify-center">
	<div class="flex justify-center">
		<div class="flex flex-col items-center rounded-xl bg-white p-5">
			<form
				on:submit|preventDefault={handleSubmit}
				class="flex flex-col items-center gap-4 text-lg"
			>
				<div>
					<label for="file">Upload your file</label>
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
			{:else if processed === ProcessedStatus.LOGIN_FAILED}
				<p class="text-7xl text-red-600">submitLog</p>
			{/if}
		</div>
	</div>
</div>
