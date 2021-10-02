<script>
	import RainbowLine from '$lib/components/layout/RainbowLine.svelte';
	import '../global.css';
</script>

<main>
	<nav>
		<picture>
			<source srcset="img/logo.webp" type="image/webp" />
			<img src="img/logo.png" alt="sendou.ink logo" />
		</picture>
	</nav>
	<RainbowLine />
	<slot />
</main>

<style>
	nav {
		text-align: center;
		padding: 0.25rem 0;
	}

	img {
		height: 2rem;
	}
</style>
