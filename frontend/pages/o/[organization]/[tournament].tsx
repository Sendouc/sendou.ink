import styled from "@emotion/styled";
import { useState } from "react";
import { InfoBanner } from "../../../components/tournament/InfoBanner";
import Tabs from "../../../components/common/Tabs";

const tabs = [
  { name: "Overview", id: "info" },
  { name: "Map Pool", id: "map-pool" },
  { name: "Bracket", id: "bracket" },
  { name: "Teams (23)", id: "teams" },
  { name: "Matches", id: "matches" },
  { name: "Streams (4)", id: "streams" },
];

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState("info");
  return (
    <S.Container>
      <InfoBanner />
      <Tabs.Container tabsCount={tabs.length}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </S.Container>
  );
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
  `,
};
