import { Link } from "@remix-run/react";
import * as React from "react";
import navItems from "~/components/layout/nav-items.json";
import { navIconUrl } from "~/utils/urls";
import { Image } from "../Image";

export function _SideNav() {
	return (
		<nav className="layout__side-nav layout__item_size">
			{navItems.map((item) => {
				return (
					<Link
						to={`/${item.url}`}
						key={item.name}
						prefetch={item.prefetch ? "render" : undefined}
					>
						<div className="layout__side-nav-image-container">
							<Image
								path={navIconUrl(item.name)}
								height={32}
								width={32}
								alt={item.name}
							/>
						</div>
					</Link>
				);
			})}
		</nav>
	);
}

export const SideNav = React.memo(_SideNav);
