<script lang="ts">
	interface Props {
		label: string;
		onclick: () => void;
		choosing: boolean;
	}

	let { onclick, label, choosing }: Props = $props();
</script>

<button
	class:bg-lele-line={choosing}
	class:text-lele-bg={choosing}
	class:bg-lele-bg={!choosing}
	class:text-lele-line={!choosing}
	class:opacity-50={!choosing}
	class="flex text-clip rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
	{onclick}
>
	{label}
</button>
