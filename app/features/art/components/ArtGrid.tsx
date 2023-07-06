import { Link } from "@remix-run/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Avatar } from "~/components/Avatar";
import { useIsMounted } from "~/hooks/useIsMounted";
import { discordFullName } from "~/utils/strings";
import { userArtPage } from "~/utils/urls";
import type { ListedArt } from "../art-types";

// xxx: add pagination
export function ArtGrid({ arts }: { arts: ListedArt[] }) {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
      <Masonry gutter="1rem">
        {arts.map((art) => {
          return (
            <Link key={art.id} to={userArtPage(art.author)}>
              <img alt="" src={art.url} loading="lazy" />
              <div className="stack sm horizontal text-xs items-center mt-1">
                <Avatar user={art.author} size="xxs" />
                {discordFullName(art.author)}
              </div>
            </Link>
          );
        })}
      </Masonry>
    </ResponsiveMasonry>
  );
}
