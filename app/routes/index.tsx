import { Main } from "~/components/Main";
import navItems from "~/components/layout/nav-items.json";
import { Image } from "~/components/Image";
import { navIconUrl } from "~/utils/urls";
import { useTranslation } from "~/hooks/useTranslation";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/front.css";
import { Link } from "@remix-run/react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function FrontPage() {
  const { t } = useTranslation(["common"]);

  // xxx: add borzoic drawing
  // xxx: test in other languages (ellipsis)
  return (
    <Main>
      <div className="front__nav-items-container">
        {navItems.map((item) => (
          <Link
            to={item.url}
            className="front__nav-item"
            key={item.name}
            prefetch={item.prefetch ? "render" : undefined}
          >
            <div className="front__nav-image-container">
              <Image
                path={navIconUrl(item.name)}
                height={48}
                width={48}
                alt=""
              />
            </div>
            <div>{t(`common:pages.${item.name}` as any)}</div>
          </Link>
        ))}
      </div>
    </Main>
  );
}
