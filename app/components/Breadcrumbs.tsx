import { Link, useMatches } from "@remix-run/react";
import { useMemo, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { isDefined } from "~/utils/arrays";
import { type SendouRouteHandle } from "~/utils/remix";

type Crumb = {
  path: string;
  name: string;
};

function useBreadcrumbs(): Crumb[] {
  const matches = useMatches();
  const { t } = useTranslation("common");

  return useMemo(
    () =>
      matches
        .map((match) => {
          const handle = match.handle as undefined | SendouRouteHandle;
          const name = handle?.breadcrumb?.({ match, t });
          return name ? { path: match.pathname, name } : undefined;
        })
        .filter(isDefined),
    [matches, t]
  );
}

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();

  const showBreadcrumbs = breadcrumbs.length > 0;

  if (!showBreadcrumbs) {
    return null;
  }

  return (
    <nav className="breadcrumbs">
      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1;

        if (isLast) {
          return <div key={crumb.path}>{crumb.name}</div>;
        }

        return (
          <Fragment key={crumb.path}>
            <div>
              <Link to={crumb.path}>{crumb.name}</Link>
            </div>
            <div>/</div>
          </Fragment>
        );
      })}
    </nav>
  );
}
