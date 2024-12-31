<script lang="ts">
	import InfoBox from '../InfoBox.svelte';

	export let showedLength;
</script>

<InfoBox title="交易次數" value={showedLength}></InfoBox>
