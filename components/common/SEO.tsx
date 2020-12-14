import { NextSeo } from "next-seo";
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
    <NextSeo
      title={fullTitle}
      description={description}
      openGraph={{
        url,
        title,
        description,
        images: [
          {
            url: imageSrc,
            width: 1200,
            height: 628,
          },
        ],
        site_name: "sendou.ink",
      }}
      twitter={{
        site: "@sendouink",
        cardType: "summary_large_image",
      }}
    />
  );
};

export default SEO;
