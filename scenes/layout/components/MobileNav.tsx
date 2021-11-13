import { Link } from "solid-app-router";
import { For } from "solid-js";
import s from "../layout.module.css";
import { navItems } from "../utils";
import { SearchInput } from "./SearchInput";

export function MobileNav(p: { isExpanded: boolean }) {
  return (
    <div
      class={s.mobileNavContainer}
      aria-hidden={p.isExpanded ? "false" : "true"}
      data-expanded={String(p.isExpanded)}
    >
      <div class={s.mobileNavTopAction}>
        <SearchInput />
      </div>
      <div class={s.mobileNavLinksContainer}>
        <For each={navItems}>
          {(navGroup) => (
            <>
              <div class={s.mobileNavGroupTitle}>{navGroup.title}</div>
              <For each={navGroup.items}>
                {(navItem, i) => (
                  <Link
                    class={s.mobileNavLink}
                    href="/"
                    data-order={
                      i() === 0
                        ? "first"
                        : i() + 1 === navGroup.items.length
                        ? "last"
                        : undefined
                    }
                  >
                    <img
                      class={s.navIcon}
                      src={`/img/layout/${navItem.replace(" ", "")}.webp`}
                    />
                    <div>{navItem}</div>
                  </Link>
                )}
              </For>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
