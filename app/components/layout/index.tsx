import { Link, useMatches } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import type { RootLoaderData } from "~/root";
import { type SendouRouteHandle } from "~/utils/remix";
import { LOGO_PATH, navIconUrl } from "~/utils/urls";
import { Image } from "../Image";
import { ColorModeToggle } from "./ColorModeToggle";
import { Footer } from "./Footer";
import { HamburgerButton } from "./HamburgerButton";
import { LanguageChanger } from "./LanguageChanger";
import { Menu } from "./Menu";
import navItems from "./nav-items.json";
import { UserItem } from "./UserItem";

function useActiveNavItem() {
  const matches = useMatches();

  return React.useMemo(() => {
    let activeItem: { name: string; url: string } | undefined = undefined;

    // `.reverse()` is mutating!
    for (const match of [...matches].reverse()) {
      const handle = match.handle as SendouRouteHandle | undefined;

      if (handle?.navItemName) {
        activeItem = navItems.find(({ name }) => name === handle.navItemName);
        break;
      }
    }

    return activeItem;
  }, [matches]);
}

export const Layout = React.memo(function Layout({
  children,
  patrons,
  isCatchBoundary = false,
}: {
  children: React.ReactNode;
  patrons?: RootLoaderData["patrons"];
  isCatchBoundary?: boolean;
}) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const activeNavItem = useActiveNavItem();

  return (
    <div className="layout__container">
      <header className="layout__header">
        <Link to="/" className="layout__logo">
          <Image
            path={LOGO_PATH}
            width={28}
            height={28}
            alt="sendou.ink logo"
          />
        </Link>
        <div className="layout__header__right-container">
          {!isCatchBoundary ? <UserItem /> : null}
          <LanguageChanger />
          <ColorModeToggle />
          <HamburgerButton
            expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>
      </header>
      <Menu expanded={menuOpen} closeMenu={() => setMenuOpen(false)} />
      {activeNavItem && (
        <h1 className="layout__page-title-header">
          <Image
            path={navIconUrl(activeNavItem.name)}
            width={28}
            height={28}
            alt=""
          />
          {t(`pages.${activeNavItem.name}` as any)}
        </h1>
      )}
      {children}
      <Footer patrons={patrons} />
    </div>
  );
});
