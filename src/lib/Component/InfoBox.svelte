<script lang="ts">
	interface Props {
		title: string;
		value?: string | number;
		bg_color?: 'normal' | 'red';
	}

	let { title, value = '', bg_color = 'normal' }: Props = $props();
</script>

<div
	class="flex justify-between rounded-xl p-2 text-lele-bg {bg_color === 'red'
		? 'bg-red-400'
		: 'bg-lele-line'}"
>
	<p class="inline">
		{title + (value !== '' ? ': ' + value : '')}
	</p>
</div>
