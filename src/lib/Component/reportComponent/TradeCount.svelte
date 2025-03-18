<script lang="ts">
	import InfoBox from '../InfoBox.svelte';

	let { showedLength } = $props();
</script>

<InfoBox title="交易次數" value={showedLength}></InfoBox>
