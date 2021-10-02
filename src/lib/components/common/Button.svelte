<button
	><slot name="icon" />
	<slot /></button
>

<style>
	button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background-color: transparent;
		color: var(--theme);
		border: var(--border) solid;
		border-color: var(--theme);
		border-radius: var(--rounded);
		padding: var(--space-2) var(--space-4);
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s;
		font-size: var(--sizes-body-large);
	}

	button:hover {
		background-color: var(--theme);
		color: var(--black);
	}
</style>
