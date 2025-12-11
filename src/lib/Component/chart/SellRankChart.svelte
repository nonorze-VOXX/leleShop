<script lang="ts">
	import { onMount } from 'svelte';
	import type { ArtistWithTradeRow } from '$lib/db';
	import { aggregateDataByDate } from './SellRankChartFunction';

	let chartContainer: HTMLDivElement;
	let chart: any;
	let ApexCharts: any;

	export let tradeDataList: ArtistWithTradeRow[] = [];
	export let metric: 'net_sales' | 'total_sales' | 'quantity' = 'net_sales';

	async function initChart() {
		if (!chartContainer) return;

		// Dynamically import ApexCharts on client side only
		if (!ApexCharts) {
			ApexCharts = (await import('apexcharts')).default;
		}

		const aggregatedData = aggregateDataByDate(tradeDataList);

		const dates = aggregatedData.map((item) => item.date);
		const metricValues = aggregatedData.map((item) => item[metric]);

		const metricLabel = {
			net_sales: 'Net Sales',
			total_sales: 'Total Sales',
			quantity: 'Quantity'
		}[metric];

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
					name: metricLabel,
					data: metricValues
				}
			],
			xaxis: {
				categories: dates,
				type: 'datetime',
				labels: {
					format: 'MMM dd, yyyy',
					rotate: -45
				}
			},
			yaxis: {
				title: {
					text: metricLabel
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
				enabled: true,
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
						if (metric === 'quantity') {
							return `${Math.round(value)} units`;
						}
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
	$: if (chartContainer && (tradeDataList || metric)) {
		initChart();
		console.log(tradeDataList.map((item) => item.trade_date));
	}
</script>

<div class="my-2 flex flex-col gap-4 rounded-xl border-2 border-lele-line p-2">
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-2">
			<label for="metric-select" class="text-sm font-medium">Metric:</label>
			<select
				id="metric-select"
				bind:value={metric}
				class="rounded border border-gray-300 px-2 py-1"
			>
				<option value="net_sales">Net Sales</option>
				<option value="quantity">Quantity</option>
			</select>
		</div>
	</div>

	<div bind:this={chartContainer} class="h-fit w-full"></div>

	{#if tradeDataList.length === 0}
		<div class="flex h-64 items-center justify-center text-lele-line">No trade data available</div>
	{/if}
</div>
