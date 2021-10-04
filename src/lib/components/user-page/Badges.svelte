<script lang="ts">
	import { fade } from 'svelte/transition';

	import SubHeader from '../common/SubHeader.svelte';

	let badges = ['itz-red', 'monday', 'pool2', 'xp27', 'pool1'];

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
	<div class="badges-container">
		{#each badges as badge, i (badge)}
			<video transition:fade autoplay muted loop playsinline on:click={() => moveBadgeFirst(i)}>
				<source src={`/video/badges/${badge}.webm`} type="video/webm" />
				<source src={`/video/badges/${badge}.mp4`} type="video/mp4" />
			</video>
		{/each}
	</div>
</div>

<style>
	video {
		width: 2.5rem;
	}

	video:first-child {
		width: 5rem;
	}

	.badges-container {
		background-color: #000;
		border-radius: var(--rounded);
		padding: var(--space-1-5);
	}
</style>
