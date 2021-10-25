import styled from "@emotion/styled";
import { ReactNode } from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";

const infos = [
  {
    title: "Starting time",
    value: "Saturday, 18:00",
  },
  {
    title: "Format",
    value: "Double Elimination",
  },
  {
    title: "Organizer",
    value: "Sendou#0043",
  },
];

const _Container = styled.div`
  width: min(48rem, 100%);
  padding: 1.5rem;
  margin: 0 auto;
  background: linear-gradient(to bottom, #9796f0, #fbc7d4);
  border-radius: var(--radii-rounded);
  color: hsl(231, 9%, 16%);
`;

const _TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
`;

const _DateName = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const _MonthDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.25;
`;

const _Month = styled.div`
  font-size: var(--fonts-xs);
`;

const _Date = styled.div`
  font-size: var(--fonts-lg);
  font-weight: bold;
`;

const _TournamentName = styled.div`
  padding-left: 1rem;
  border-color: var(--colors-text);
  border-left: 1px solid;
  font-size: var(--fonts-xl);
  font-weight: bold;
`;

const _BottomRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;

  @media only screen and (min-width: 600px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const _Infos = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
  gap: 1rem;

  @media only screen and (min-width: 500px) {
    gap: 2rem;
  }
`;

const _IconButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

export function InfoBanner() {
  return (
    <_Container>
      <_TopRow>
        <_DateName>
          <_MonthDate>
            <_Month>APR</_Month>
            <_Date>23</_Date>
          </_MonthDate>
          <_TournamentName>In The Zone 23</_TournamentName>
        </_DateName>
        <_IconButtons>
          <IconButton href="https://twitter.com/sendouc">
            <FaTwitter />
          </IconButton>
          <IconButton href="https://discord.gg/sendou">
            <FaDiscord />
          </IconButton>
        </_IconButtons>
      </_TopRow>
      <_BottomRow>
        <_Infos>
          {infos.map((info) => (
            <Info key={info.title} info={info} />
          ))}
        </_Infos>
      </_BottomRow>
    </_Container>
  );
}

const _InfoContainer = styled.div`
  font-size: var(--fonts-xs);

  > label {
    font-weight: bold;
  }
`;

function Info(props: { info: { title: string; value: string } }) {
  return (
    <_InfoContainer>
      <label>{props.info.title}</label>
      <div>{props.info.value}</div>
    </_InfoContainer>
  );
}

const _IconButton = styled.a`
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid;
  border-color: var(--text-transparent);
  border-radius: 50%;
  color: inherit;
  transition: background-color 0.3s;
  :hover {
    background-color: var(--text-transparent);
  }
  > svg {
    height: 1.75rem;
  }
`;

function IconButton(props: { children: ReactNode; href: string }) {
  return <_IconButton href={props.href}>{props.children}</_IconButton>;
}
