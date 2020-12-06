import Head from "next/head";

interface Props {
  title: string;
  appendSendouInk?: boolean;
}

const MyHead: React.FC<Props> = ({ title, appendSendouInk = true }) => {
  const pageTitle = appendSendouInk ? `${title} | sendou.ink` : title;
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} key="title" />
    </Head>
  );
};

export default MyHead;
