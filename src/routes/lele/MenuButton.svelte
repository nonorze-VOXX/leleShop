<script lang="ts">
	interface Props {
		label: string;
		onclick: () => void;
	}

	let { onclick, label }: Props = $props();
</script>

<button class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg" {onclick}>
	{label}
</button>
