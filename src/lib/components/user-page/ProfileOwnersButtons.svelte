<script>
	import Button from '$lib/components/common/Button.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
</script>

<div class="container">
	<Button><Edit slot="icon" />Edit profile</Button><Button><Plus slot="icon" />Add build</Button>
</div>

<style>
	.container {
		margin-top: var(--space-6);
		display: flex;
		justify-content: space-evenly;
	}
</style>
