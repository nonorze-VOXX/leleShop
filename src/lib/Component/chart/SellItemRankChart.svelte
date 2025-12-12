<script lang="ts">
	import { onMount } from 'svelte';
	import type { ArtistWithTradeRow } from '$lib/db';
	import { aggregateDataByDate, aggregateDataByItem } from './SellRankChartFunction';

	let chartContainer: HTMLDivElement;
	let chart: any;
	let ApexCharts: any;

	export let tradeDataList: ArtistWithTradeRow[] = [];

	async function initChart() {
		if (!chartContainer) return;

		// Dynamically import ApexCharts on client side only
		if (!ApexCharts) {
			ApexCharts = (await import('apexcharts')).default;
		}

		const aggregatedData = aggregateDataByItem(tradeDataList);

		const names = aggregatedData.map((item) => item.itemName);
		const metricValues = aggregatedData.map((item) => item.net_sales);

		const leleLineColor = '#583225';

		const options: ApexCharts.ApexOptions = {
			chart: {
				type: 'bar',
				height: 350,
				toolbar: {
					show: true,
					tools: {
						download: true,
						selection: false,
						zoom: false,
						zoomin: false,
						zoomout: false,
						pan: false,
						reset: false
					}
				},
				animations: {
					enabled: true,
					speed: 800,
					animateGradually: {
						enabled: true,
						delay: 150
					}
				}
			},
			series: [
				{
					name: 'Net Sales',
					data: metricValues
				}
			],
			xaxis: {
				categories: names,
				type: 'category',
				labels: {
					rotate: -90
				}
			},
			yaxis: {
				title: {
					text: ''
				},
				labels: {
					formatter: function (value) {
						return Math.round(value).toString();
					}
				}
			},
			fill: {
				colors: [leleLineColor]
			},
			dataLabels: {
				enabled: false,
				style: {
					colors: [leleLineColor],
					fontSize: '12px',
					fontWeight: 600
				},
				background: {
					enabled: true,
					foreColor: '#fff',
					borderColor: leleLineColor,
					borderRadius: 3,
					padding: 4,
					opacity: 1
				}
			},
			tooltip: {
				theme: 'light',
				x: {
					format: 'MMM dd, yyyy'
				},
				y: {
					formatter: (value) => {
						return `$${value.toFixed(2)}`;
					}
				}
			},
			grid: {
				show: true,
				borderColor: '#e0e0e0'
			},
			responsive: [
				{
					breakpoint: 1024,
					options: {
						chart: {
							height: 300
						}
					}
				},
				{
					breakpoint: 768,
					options: {
						chart: {
							height: 250
						}
					}
				}
			]
		};

		// Destroy existing chart if it exists
		if (chart) {
			chart.destroy();
		}

		chart = new ApexCharts(chartContainer, options);
		chart.render();
	}

	onMount(async () => {
		await initChart();
	});

	// Re-initialize chart when data or settings change
	$: if (chartContainer && tradeDataList) {
		initChart();
		console.log(tradeDataList.map((item) => item.trade_date));
	}
</script>

<div class="my-2 flex flex-col gap-4 rounded-xl border-2 border-lele-line p-2">
	<div bind:this={chartContainer} class="h-fit w-full"></div>

	{#if tradeDataList.length === 0}
		<div class="flex h-64 items-center justify-center text-lele-line">No trade data available</div>
	{/if}
</div>
