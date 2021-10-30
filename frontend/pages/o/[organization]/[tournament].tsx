import styled from "@emotion/styled";
import { InfoBanner } from "components/tournament/InfoBanner";
import { Tab } from "components/common/Tab";

const tabs = [
  { name: "Overview", id: "info" },
  { name: "Map Pool", id: "map-pool" },
  { name: "Bracket", id: "bracket" },
  { name: "Teams (23)", id: "teams" },
  { name: "Matches", id: "matches" },
  { name: "Streams (4)", id: "streams" },
];

export default function TournamentPage() {
  return (
    <S.Container>
      <InfoBanner />
      <Tab.Group>
        <Tab.List tabsCount={tabs.length}>
          {tabs.map((tab) => (
            <Tab key={tab.id}>{tab.name}</Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
          <Tab.Panel>Content 4</Tab.Panel>
          <Tab.Panel>Content 5</Tab.Panel>
          <Tab.Panel>Content 6</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
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
