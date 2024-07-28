import {
	isRouteErrorResponse,
	useLocation,
	useRouteError,
} from "@remix-run/react";
import { SideNav } from "app/components/layout/SideNav";
import clsx from "clsx";
import type * as React from "react";
import { useUser } from "~/features/auth/core/user";

export const Main = ({
	children,
	className,
	classNameOverwrite,
	halfWidth,
	bigger,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	classNameOverwrite?: string;
	halfWidth?: boolean;
	bigger?: boolean;
	style?: React.CSSProperties;
}) => {
	const error = useRouteError();
	const user = useUser();
	const showLeaderboard =
		import.meta.env.VITE_PLAYWIRE_PUBLISHER_ID &&
		!user?.patronTier &&
		!isRouteErrorResponse(error);

	const location = useLocation();
	const isFrontPage = location.pathname === "/";

	return (
		<div className="layout__main-container">
			{!isFrontPage ? <SideNav /> : null}
			<main
				className={
					classNameOverwrite
						? clsx(classNameOverwrite, {
								"half-width": halfWidth,
								"pt-8-forced": showLeaderboard,
							})
						: clsx(
								"layout__main",
								"main",
								{
									"half-width": halfWidth,
									bigger,
									"pt-8-forced": showLeaderboard,
								},
								className,
							)
				}
				style={style}
			>
				{children}
			</main>
		</div>
	);
};
