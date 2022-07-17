import * as React from "react";
import { HamburgerButton } from "./HamburgerButton";
import { Menu } from "./Menu";
import { UserItem } from "./UserItem";
import navItems from "./nav-items.json";
import { useLocation } from "@remix-run/react";
import { Image } from "../Image";
import { Footer } from "./Footer";
import type { RootLoaderData } from "~/root";
import { useTranslation } from "react-i18next";

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
        {currentPagesNavItem ? (
          <h1 className="layout__page-heading">
            <Image
              className="layout__icon"
              path={`/img/layout/${currentPagesNavItem.name}`}
              width={40}
              height={40}
              alt=""
            />
            {t(`pages.${currentPagesNavItem.name}` as any)}
          </h1>
        ) : (
          <div />
        )}
        <div className="layout__header__right-container">
          {!isCatchBoundary ? <UserItem /> : null}
          <HamburgerButton
            expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>
      </header>
      <Menu expanded={menuOpen} closeMenu={() => setMenuOpen(false)} />
      {children}
      <Footer patrons={patrons} />
    </div>
  );
});
