<script>
	import '../app.css';
</script>

<div class="flex min-h-screen flex-col justify-between bg-lele-bg text-red-950">
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
	<footer>
		<div class=" w-full bg-lele-line p-4 text-center font-semibold text-lele-bg">
			這個網頁還在開發中，僅供參考 如果有bug 或是想要新功能 請回報給管理員
		</div>
	</footer>
</div>
