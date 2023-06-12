import { Link } from "@remix-run/react";
import navItems from "~/components/layout/nav-items.json";
import { useTranslation } from "~/hooks/useTranslation";
import { navIconUrl } from "~/utils/urls";
import { Image } from "../Image";
import { useEffect, useState } from "react";

export function SideNav() {
  const { t } = useTranslation(["common"]);
  const [isOverflowed, setIsOverflowed] = useState(false);

  function overflowDetector() {
    const firstLink = document.querySelector<HTMLAnchorElement>(
      ".layout__side-nav > :first-child"
    );
    const header = document.querySelector<HTMLElement>("header");
    if (!firstLink || !header) return false;
    return firstLink.offsetTop < +header.style.height;
  }

  useEffect(() => {
    function overflowHandler() {
      setIsOverflowed(overflowDetector());
    }

    overflowHandler(); // call it once when the nav is mounted

    window.addEventListener("resize", overflowHandler);
    return () => {
      window.removeEventListener("resize", overflowHandler);
    };
  }, []); // isOverflowed is not added here to prevent loop

  // every time isOverflowed changes, check it again
  useEffect(() => {
    if (overflowDetector()) {
      setIsOverflowed(true);
    }
  }, [isOverflowed]);

  return (
    <nav
      className={`layout__side-nav layout__item_size ${
        isOverflowed ? "layout__side-nav-flex-start" : ""
      }`}
    >
      {navItems.map((item) => {
        return (
          <Link
            to={item.url}
            key={item.name}
            prefetch={item.prefetch ? "render" : undefined}
          >
            <div className="layout__side-nav-image-container">
              <Image
                path={navIconUrl(item.name)}
                height={32}
                width={32}
                alt={t(`common:pages.${item.name}` as any)}
              />
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
