<div class="header-container">
	<img class="pfp" src="/img/pfp-test.png" alt="Sendou" />
	<div>
		<h2 class="name">Sendou#0043</h2>
		<div class="country">
			<img src="https://www.countryflags.io/fi/flat/16.png" alt="Flag of Finland" /> Finland
		</div>
		<div class="team">
			<img src="/img/team-pfp-test.png" alt="Team Olive" /> Team Olive
		</div>
	</div>
</div>

<style>
	.header-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.name {
		font-size: var(--sizes-heading);
	}

	.country {
		display: flex;
		align-items: center;
		color: var(--text-secondary);
	}

	.country > img {
		margin-right: var(--space-1);
		margin-top: 1px;
	}

	.team {
		display: flex;
		align-items: center;
		font-weight: bold;
		font-size: var(--sizes-sub-heading);
		margin-top: var(--space-3-5);
	}

	.team > img {
		border-radius: 50%;
		height: 2.5rem;
		margin-right: var(--space-2);
	}

	.pfp {
		border-radius: 50%;
		height: 7rem;
		filter: var(--shadow);
	}

	@media only screen and (min-width: 500px) {
		.pfp {
			height: 10rem;
		}
	}
</style>
