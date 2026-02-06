<script lang="ts">
	interface Props {
		title: string;
		value?: string | number;
		text_color?: 'normal' | 'red';
	}

	let { title, value = '', text_color = 'normal' }: Props = $props();
</script>

<div
	class="flex justify-between rounded-xl bg-lele-line p-2 {text_color === 'red'
		? 'text-red-400'
		: 'text-lele-bg'}"
>
	<p class="inline">
		{title}
		{#if value !== ''}:
		{/if}
	</p>
	<p class="inline">{value}</p>
</div>
