<script>
	import '../app.css';
</script>

<div class="min-h-screen bg-lele-bg text-red-950">
	<div class="flex flex-col items-center p-2">
		<div class="h-36 w-36">
			<a href="/">
				<img src="/thecreateicon.png" alt="no icon" />
			</a>
		</div>
		<div class="w-full p-4 lg:w-3/4 xl:w-3/4">
			<slot />
		</div>
	</div>
</div>
