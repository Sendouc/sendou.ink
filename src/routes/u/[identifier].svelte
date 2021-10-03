<script>
	import AvatarHeader from '$lib/components/user-page/AvatarHeader.svelte';
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
</div>

<style>
	.container > :global(:nth-child(n + 2)) {
		margin-top: var(--space-8);
	}

	.container > :global(:nth-child(2)) {
		margin-top: var(--space-6);
	}
</style>
