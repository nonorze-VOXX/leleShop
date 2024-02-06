<script lang="ts">
	import db, { supabase } from '../db';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#each data.data as trade}
	{trade.artist_name}
{/each}
