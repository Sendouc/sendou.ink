import React from "react";
import { GetUsersXRankPlacementsQuery } from "../../generated/graphql";
import ModesAccordion from "./ModesAccordion";

interface XRankTabProps {
  placementsData: GetUsersXRankPlacementsQuery;
}

const XRankTab: React.FC<XRankTabProps> = ({ placementsData }) => {
  return (
    <>
      <ModesAccordion placementsData={placementsData} />
    </>
  );
};

export default XRankTab;
