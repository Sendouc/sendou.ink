import Head from "next/head";
import { useRouter } from "next/router";

interface Props {
  title: string;
  description: string;
  // 1200x628
  imageSrc: string;
  appendTitle?: boolean;
}

const SEO: React.FC<Props> = ({
  title,
  description,
  imageSrc,
  appendTitle = true,
}) => {
  const router = useRouter();
  const fullTitle = appendTitle ? `${title} | sendou.ink` : title;
  const url = "https://sendou.ink" + router.pathname;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageSrc} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageSrc} />
    </Head>
  );
};

export default SEO;
