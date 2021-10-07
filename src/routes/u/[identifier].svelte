<script>
	import AvatarHeader from '$lib/components/user-page/AvatarHeader.svelte';
	import Badges from '$lib/components/user-page/Badges.svelte';
	import Bio from '$lib/components/user-page/Bio.svelte';
	import PeakPowers from '$lib/components/user-page/PeakPowers.svelte';
	import ProfileOwnersButtons from '$lib/components/user-page/ProfileOwnersButtons.svelte';
	import WeaponPool from '$lib/components/user-page/WeaponPool.svelte';
	import { defaultTitle } from '$lib/utils';
</script>

<svelte:head>
	<title>{defaultTitle('Sendou#0043')}</title>
</svelte:head>

<div class="container">
	<AvatarHeader />
	<ProfileOwnersButtons />
	<WeaponPool />
	<Badges />
	<PeakPowers />
	<Bio />
</div>

<style>
	.container > :global(:nth-child(n + 2)) {
		margin-top: var(--space-8);
	}
</style>
