import clsx from "clsx";
import { Popover } from "./Popover";

export function InfoPopover({
	children,
	tiny = false,
}: { children: React.ReactNode; tiny?: boolean }) {
	return (
		<Popover
			buttonChildren={<>?</>}
			triggerClassName={clsx("info-popover__trigger", {
				"info-popover__trigger__tiny": tiny,
			})}
		>
			{children}
		</Popover>
	);
}
