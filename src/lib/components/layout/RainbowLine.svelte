<div class="container">
	<div class="first" />
	<div class="second" />
	<div class="third" />
	<div class="fourth" />
	<div class="fifth" />
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 1fr 2fr 2fr 2fr 1fr;
		height: calc(var(--border) * 2);
	}

	.first {
		background-color: var(--theme-2);
	}

	.second {
		background-color: var(--theme-3);
	}

	.third {
		background-color: var(--theme);
	}

	.fourth {
		background-color: var(--theme-4);
	}

	.fifth {
		background-color: var(--theme-5);
	}
</style>
