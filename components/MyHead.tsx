import Head from "next/head";

interface Props {
  title: string;
}

const MyHead: React.FC<Props> = ({ title }) => {
  const pageTitle = `${title} | sendou.ink`;
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} key="title" />
    </Head>
  );
};

export default MyHead;
