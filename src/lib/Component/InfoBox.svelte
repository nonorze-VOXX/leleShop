<script lang="ts">
	export let title: string;
	export let value: string | number = '';
</script>

<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
	<p class="inline">{title}</p>
	<p class="inline">: {value}</p>
</div>
