<script>
	import '../app.css';
</script>

<div class="bg-lele-bg min-h-screen text-red-950">
	<div class="flex flex-col p-2 items-center">
		<div class="w-24 h-24">
			<img src="/favicon.png" alt="no icon" />
		</div>
		<div class="p-4 xl:w-3/4 lg:w-3/4 w-full">
			<slot />
		</div>
	</div>
</div>
