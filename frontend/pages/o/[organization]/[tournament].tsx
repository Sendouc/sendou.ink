import { InfoBanner } from "components/tournament/InfoBanner";
import { Tab } from "components/common/Tab";
import { styled } from "stitches.config";
import { MapPoolTab } from "components/tournament/MapPoolTab";
import { OverviewTab } from "components/tournament/OverviewTab";
import { Select } from "components/common/Select";
import { useState } from "react";

const tabs = [
  { name: "Overview", id: "info", component: <OverviewTab /> },
  { name: "Map Pool", id: "map-pool", component: <MapPoolTab /> },
  { name: "Bracket", id: "bracket", component: null },
  { name: "Teams (23)", id: "teams", component: null },
  { name: "Streams (4)", id: "streams", component: null },
];

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  return (
    <S_Container>
      <InfoBanner />
      <S_TabsContainer>
        <Tab.Group>
          <Tab.List tabsCount={tabs.length}>
            {tabs.map((tab) => (
              <Tab key={tab.id}>{tab.name}</Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {tabs.map((tab) => (
              <Tab.Panel key={tab.id}>{tab.component}</Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </S_TabsContainer>
      <S_MobileContent>
        <S_SelectContainer>
          <Select
            values={tabs}
            onChange={(e) => setActiveTab(e.target.value)}
            selected={activeTab}
          />
        </S_SelectContainer>
        {tabs.find((tab) => tab.id === activeTab)!.component}
      </S_MobileContent>
    </S_Container>
  );
}

const S_Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "$8",
});

const S_TabsContainer = styled("div", {
  display: "none",

  "@sm": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "$8",
  },
});

const S_SelectContainer = styled("div", {
  width: "12rem",
  margin: "0 auto",
  marginBottom: "$8",
});

const S_MobileContent = styled("div", {
  "@sm": {
    display: "none",
  },
});
