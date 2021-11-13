import { Link } from "solid-app-router";
import { createSignal, For, JSXElement } from "solid-js";
import s from "../layout.module.css";
import { navItems } from "../utils";
import { HamburgerButton } from "./HamburgerButton";
import { MobileNav } from "./MobileNav";
import { SearchInput } from "./SearchInput";

export function Layout(p: { children: JSXElement }) {
  const [menuExpanded, setMenuExpanded] = createSignal(false);
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
          <HamburgerButton
            isExpanded={menuExpanded()}
            onClick={() => setMenuExpanded((expanded) => !expanded)}
          />
          <img
            class={s.avatar}
            src="https://cdn.discordapp.com/avatars/79237403620945920/fcfd65a3bea598905abb9ca25296816b.png?size=80"
          />
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
