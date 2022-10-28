import clsx from "clsx";
import { Link } from "@remix-run/react";
import navItems from "./nav-items.json";
import { Image } from "../Image";
import { useIsMounted } from "~/hooks/useIsMounted";
import { canPerformAdminActions } from "~/permissions";
import { useUser } from "~/modules/auth";
import { useTranslation } from "react-i18next";

export function Menu({
  expanded,
  closeMenu,
}: {
  expanded: boolean;
  closeMenu: () => void;
}) {
  const user = useUser();
  const isMounted = useIsMounted();
  const { t } = useTranslation();

  // without this menu is initially visible due to SSR and not knowing user screen width on server (probably)
  if (!isMounted) return null;

  const visibleNavItems = navItems.filter((navItem) => {
    if (navItem.name === "admin") {
      return canPerformAdminActions(user);
    }

    return true;
  });

  return (
    <nav className={clsx("layout__menu", { expanded })} aria-hidden={!expanded}>
      <div className="layout__menu__links">
        {visibleNavItems.map((navItem, i) => (
          <Link
            key={navItem.name}
            className={clsx("layout__menu__link", {
              first: i === 0,
              last: i + 1 === visibleNavItems.length,
            })}
            to={navItem.url ?? navItem.name}
            onClick={closeMenu}
            data-cy={`menu-link-${navItem.name}`}
            tabIndex={!expanded ? -1 : undefined}
            prefetch={navItem.prefetch ? "render" : undefined}
          >
            <Image
              className="layout__menu__link__icon"
              path={`/img/layout/${navItem.name.replace(" ", "")}`}
              alt={navItem.name}
            />
            <div>{t(`pages.${navItem.name}` as any)}</div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
