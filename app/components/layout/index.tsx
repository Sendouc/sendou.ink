import { useLocation } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import type { RootLoaderData } from "~/root";
import { Image } from "../Image";
import { ColorModeToggle } from "./ColorModeToggle";
import { Footer } from "./Footer";
import { HamburgerButton } from "./HamburgerButton";
import { LanguageChanger } from "./LanguageChanger";
import { Menu } from "./Menu";
import navItems from "./nav-items.json";
import { UserItem } from "./UserItem";

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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const currentPagesNavItem = navItems.find((navItem) =>
    location.pathname.includes(navItem.name)
  );

  return (
    <div className="layout__container">
      <header className="layout__header">
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
      {currentPagesNavItem && (
        <div className="layout__page-title-header">
          <Image
            path={`/img/layout/${currentPagesNavItem.name}`}
            width={28}
            height={28}
            alt=""
          />
          {t(`pages.${currentPagesNavItem.name}` as any)}
        </div>
      )}
      {children}
      <Footer patrons={patrons} />
    </div>
  );
});
