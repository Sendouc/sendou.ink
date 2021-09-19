import { t, Trans } from "@lingui/macro";
import MyHead from "components/common/MyHead";
import MyLink from "components/common/MyLink";
import Heading from "components/elements/Heading";
import links from "utils/data/links.json";
import styles from "./links.module.css";

interface Link {
  title: string;
  url: string;
  description: string;
}

const LinksPage = () => {
  const linkMap = (link: Link) => (
    <div key={link.title} className="my-4">
      <MyLink href={link.url} isExternal>
        <b>{link.title}</b>
      </MyLink>{" "}
      - <span>{link.description}</span>
    </div>
  );

  return (
    <>
      <MyHead title={t`Links`} />
      <Heading className={styles.heading}>
        <Trans>Guides</Trans>
      </Heading>
      {links.guides.map(linkMap)}
      <Heading className={styles.heading}>YouTube</Heading>
      {links.youtube.map(linkMap)}
      <Heading className={styles.heading}>Discord</Heading>
      {links.discord.map(linkMap)}
      <Heading className={styles.heading}>
        <Trans>Misc</Trans>
      </Heading>
      {links.misc.map(linkMap)}
    </>
  );
};

export default LinksPage;
