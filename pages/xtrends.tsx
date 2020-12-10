import { GetStaticProps } from "next";
import { getXTrends, GetXTrendsData } from "prisma/queries/getXTrends";

const tiers = [
  {
    label: "X",
    criteria: 6,
    color: "purple.700",
  },
  {
    label: "S+",
    criteria: 5,
    color: "red.700",
  },
  {
    label: "S",
    criteria: 4,
    color: "red.700",
  },
  {
    label: "A+",
    criteria: 3,
    color: "orange.700",
  },
  {
    label: "A",
    criteria: 2,
    color: "orange.700",
  },
  {
    label: "B+",
    criteria: 1.5,
    color: "yellow.700",
  },
  {
    label: "B",
    criteria: 1,
    color: "yellow.700",
  },
  {
    label: "C+",
    criteria: 0.5,
    color: "green.700",
  },
  {
    label: "C",
    criteria: 0.002, //1 in 500
    color: "green.700",
  },
] as const;

interface Props {
  trends: GetXTrendsData;
}

const XTrendsPage: React.FC<Props> = ({ trends }) => {
  console.log({ trends });
  return <>asd</>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const trends = await getXTrends();

  return { props: { trends } };
};

export default XTrendsPage;
