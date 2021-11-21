import { Link } from "solid-app-router";
import { createSignal, For, JSXElement } from "solid-js";
import s from "../styles/Layout.module.css";
import { navItems } from "../utils";
import { HamburgerButton } from "./HamburgerButton";
import { MobileNav } from "./MobileNav";
import { SearchInput } from "./SearchInput";
import { UserItem } from "./UserItem";

export function Layout(p: { children: JSXElement }) {
  const [menuExpanded, setMenuExpanded] = createSignal(false);

  function toggleMenu() {
    setMenuExpanded((expanded) => !expanded);
  }

  // TODO: why logo wide?
  return (
    <>
      <header class={s.header}>
        <Link href="/">
          <div class={s.logoContainer}>
            <img class={s.logo} src="/img/layout/logo.webp" />
          </div>
        </Link>
        <div class={s.searchContainer}>
          <SearchInput />
        </div>
        <div class={s.rightContainer}>
          <UserItem />
          <HamburgerButton isExpanded={menuExpanded()} onClick={toggleMenu} />
        </div>
      </header>
      <MobileNav isExpanded={menuExpanded()} />
      <nav class={s.nav}>
        <div class={s.navItems}>
          <For each={navItems}>
            {(navGroup) => (
              <div class={s.navItemColumn}>
                <div class={s.navGroupTitle}>{navGroup.title}</div>
                <For each={navGroup.items}>
                  {(navItem) => (
                    <Link class={s.navLink} href="/">
                      <img
                        src={`/img/layout/${navItem.replace(" ", "")}.webp`}
                        class={s.navIcon}
                      />
                      {navItem}
                    </Link>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </nav>
      <main class={s.main}>{p.children}</main>
    </>
  );
}
