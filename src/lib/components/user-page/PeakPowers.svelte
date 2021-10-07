<script lang="ts">
	import SubHeader from '../common/SubHeader.svelte';

	const powers = [
		{
			value: 2910.4,
			mode: 'SZ'
		},
		{
			value: 2728.2,
			mode: 'TC'
		},
		{
			value: 2842,
			mode: 'RM'
		},
		{
			value: 2644.2,
			mode: 'CB'
		},
		{
			value: 2650.5,
			mode: 'TWIN'
		},
		{
			value: 2550,
			mode: 'QUAD'
		}
	];

	function chartLength(powerValue: number) {
		if (powerValue <= 2500) return 0;
		if (powerValue >= 3000) return 150;

		return (powerValue - 2500) / 3.33;
	}
</script>

<div class="bio">
	<SubHeader>Peak powers</SubHeader>
	<div class="bar-charts">
		{#each powers as power (power.mode)}
			<div class="bar-chart-column">
				<!-- TODO: Smaller size and webm -->
				<!-- TODO: league icons -->
				<img src={`/img/modes/${power.mode}.png`} alt="" />
				<div
					style={`--chart-height: ${chartLength(power.value)}px;`}
					class={`${power.mode} chart`}
				/>
				<div class="power">{`${power.value.toFixed(1)}`}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.bar-charts {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 1rem;
	}

	.chart {
		height: calc(50px + var(--chart-height));
		width: var(--space-6);
		background-color: aliceblue;
		filter: var(--shadow);
	}

	.bar-chart-column {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}

	.bar-chart-column > img {
		width: 24px;
		margin-bottom: var(--space-1);
	}

	.power {
		writing-mode: vertical-lr;
		transform: rotate(220deg);
		color: var(--text-secondary);
		margin-top: var(--space-1-5);
		margin-left: -7px;
		font-size: var(--sizes-small);
	}

	.SZ {
		background-color: var(--theme-2);
	}

	.TC {
		background-color: var(--theme-3);
	}

	.RM {
		background-color: var(--theme);
	}

	.CB {
		background-color: var(--theme-4);
	}

	.TWIN {
		background-color: var(--theme-5);
	}

	.QUAD {
		background-color: #fff;
	}
</style>
