import { Main } from "~/components/Main";
import { useSetTitle } from "~/hooks/useSetTitle";
import { useTranslation } from "~/hooks/useTranslation";
import type { SendouRouteHandle } from "~/utils/remix";
import { LINKS_PAGE, navIconUrl } from "~/utils/urls";
import links from "../links.json";
import { DiscordIcon } from "~/components/icons/Discord";
import { YouTubeIcon } from "~/components/icons/YouTube";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("links"),
    href: LINKS_PAGE,
    type: "IMAGE",
  }),
};

export default function LinksPage() {
  const { t } = useTranslation(["common"]);
  useSetTitle(t("common:pages.links"));

  return (
    <Main>
      <div className="stack md">
        {links
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((link) => {
            const isDiscord = link.url.includes("discord");
            const isYoutube = link.url.includes("youtube");

            return (
              <div key={link.url}>
                <h2 className="text-sm">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stack sm horizontal items-center"
                  >
                    {link.title}
                    {isDiscord ? (
                      <DiscordIcon className="discord-icon" />
                    ) : null}
                    {isYoutube ? (
                      <YouTubeIcon className="youtube-icon" />
                    ) : null}
                  </a>
                </h2>
                <div className="text-sm text-lighter">{link.description}</div>
              </div>
            );
          })}
      </div>
    </Main>
  );
}
