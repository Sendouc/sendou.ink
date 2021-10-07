<script lang="ts">
	import SubHeader from '../common/SubHeader.svelte';
	import { browser } from '$app/env';
	import { fly } from 'svelte/transition';

	let badges = [
		{
			name: 'itz-red',
			description: 'Awarded for winning In The Zone'
		},
		{
			name: 'monday',
			description: 'Awarded for winning Monday Afterparty'
		},
		{
			name: 'pool2',
			description: 'Awarded for winning Paddling Pool (Golden Event)'
		},
		{
			name: 'xp27',
			description: 'Reached XP2700 in X Rank'
		},
		{
			name: 'pool1',
			description: 'Awarded for winning Paddling Pool'
		}
	];

	$: {
		if (browser) {
			const videoElement = document.getElementById('big-badge') as HTMLVideoElement;

			if (videoElement) {
				const extension = videoElement.canPlayType('video/webm') ? 'webm' : 'mp4';
				videoElement.src = `/video/badges/${badges[0].name}.${extension}`;
			}
		}
	}

	function moveBadgeFirst(i: number) {
		if (i === 0) return;
		const firstBadge = badges[0];
		const targetBadge = badges[i];
		badges[i] = firstBadge;
		badges[0] = targetBadge;
		badges = badges;
	}
</script>

<div>
	<SubHeader>Badges</SubHeader>
	<div class="container">
		<div class="badges-container">
			<div>
				<!-- TODO: Make focusable and make hover state -->
				<video id="big-badge" autoplay muted loop playsinline>
					<source src={`/video/badges/${badges[0].name}.webm`} type="video/webm" />
					<source src={`/video/badges/${badges[0].name}.mp4`} type="video/mp4" />
				</video>
			</div>
			<div class="small-badges-container">
				{#each badges.slice(1) as badge, i (badge.name)}
					<div>
						<video muted loop playsinline on:click={() => moveBadgeFirst(i + 1)}>
							<source src={`/video/badges/${badge.name}.webm`} type="video/webm" />
							<source src={`/video/badges/${badge.name}.mp4`} type="video/mp4" />
						</video>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<!-- TODO: layout shift when two lines -->
	{#key badges[0].description}
		<div in:fly={{ y: -20, delay: 100 }} class="desc">{badges[0].description}</div>
	{/key}
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
	}

	.badges-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		background-color: #000;
		border-radius: var(--rounded);
		padding: var(--space-1-5);
		padding-left: var(--space-5);
		max-width: 17rem;
	}

	video {
		width: 2.5rem;
	}

	.badges-container > div > video {
		width: 5rem;
	}

	.small-badges-container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}

	.small-badges-container > div {
		width: 48px;
		height: 48px;
	}

	.desc {
		text-align: center;
		color: var(--text-secondary);
		margin-top: var(--space-4);
	}
</style>
