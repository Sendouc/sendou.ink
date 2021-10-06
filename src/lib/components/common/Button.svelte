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
		padding: var(--space-1) var(--space-3);
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.3s;
		outline-offset: 3px;
		outline: 2px solid transparent;
	}

	button:hover {
		background-color: var(--theme);
		color: var(--black);
		outline: none;
	}

	button:focus {
		outline-color: inherit;
	}
</style>
