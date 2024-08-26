export function Table({ children }: { children: React.ReactNode }) {
	return (
		<div className="my-new-table__container">
			<table className="my-new-table">{children}</table>
		</div>
	);
}
