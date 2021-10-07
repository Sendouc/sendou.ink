<script>
	import SubHeader from '../common/SubHeader.svelte';
</script>

<div class="weapon-pool">
	<SubHeader>Weapon pool</SubHeader>
	<div class="weapons-container">
		<img src="/img/wpn-nzap-85.png" alt="N-ZAP '85" />
		<img src="/img/wpn-tenta-brella.png" alt="Tenta Brella" />
		<img src="/img/wpn-grim-range-blaster.png" alt="Grim Range Blaster" />
		<img src="/img/wpn-custom-blaster.png" alt="Custom Blaster" />
	</div>
	<div class="sens">+4.5 stick, +4 motion</div>
</div>

<style>
	.sens {
		text-align: center;
		color: var(--text-secondary);
		margin-top: var(--space-4);
	}

	.weapons-container {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
	}

	.weapons-container > img {
		width: 15%;
		max-width: 75px;
		filter: var(--shadow);
	}
</style>
