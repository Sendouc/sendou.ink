import { Link } from "@remix-run/react";
import navItems from "~/components/layout/nav-items.json";
import { useTranslation } from "~/hooks/useTranslation";
import { navIconUrl } from "~/utils/urls";
import { Image } from "../Image";

export function SideNav() {
  const { t } = useTranslation(["common"]);

  return (
    <nav className="layout__side-nav">
      {navItems.map((item) => {
        return (
          <div className="nav-item" key={item.name}>
            <div className="layout__side-nav-image-container">
              <Link
                to={item.url}
                key={item.name}
                prefetch={item.prefetch ? "render" : undefined}
              >
                <Image
                  path={navIconUrl(item.name)}
                  height={32}
                  width={32}
                  alt={t(`common:pages.${item.name}` as any)}
                />
              </Link>
              <span className="tooltip-text">
                {t(`common:pages.${item.name}` as any)}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
