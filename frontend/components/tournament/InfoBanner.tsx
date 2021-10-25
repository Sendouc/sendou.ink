import styled from "@emotion/styled";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { useTournamentData } from "../../hooks/data/useTournamentData";

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

export function InfoBanner() {
  const { data } = useTournamentData();

  // TODO: handle loading
  // TODO: handle error in parent
  if (!data) return null;

  return (
    <S.Container>
      <S.TopRow>
        <S.DateName>
          <S.MonthDate>
            <S.Month>APR</S.Month>
            <S.Date>23</S.Date>
          </S.MonthDate>
          <S.TournamentName>{data.name}</S.TournamentName>
        </S.DateName>
        <S.IconButtons>
          {data.organizer.twitter && (
            <S.IconButton href={data.organizer.twitter}>
              <FaTwitter />
            </S.IconButton>
          )}
          <S.IconButton href={data.organizer.discordInvite}>
            <FaDiscord />
          </S.IconButton>
        </S.IconButtons>
      </S.TopRow>
      <S.BottomRow>
        <S.Infos>
          {infos.map((info) => (
            <S.InfoContainer key={info.title}>
              <label>{info.title}</label>
              <div>{info.value}</div>
            </S.InfoContainer>
          ))}
        </S.Infos>
      </S.BottomRow>
    </S.Container>
  );
}

const S = {
  Container: styled.div`
    width: min(48rem, 100%);
    padding: 1.5rem;
    margin: 0 auto;
    background: linear-gradient(to bottom, #9796f0, #fbc7d4);
    border-radius: var(--radii-rounded);
    color: hsl(231, 9%, 16%);
  `,
  TopRow: styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
  `,
  DateName: styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
  `,
  MonthDate: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.25;
  `,
  Month: styled.div`
    font-size: var(--fonts-xs);
  `,
  Date: styled.div`
    font-size: var(--fonts-lg);
    font-weight: bold;
  `,
  TournamentName: styled.div`
    padding-left: 1rem;
    border-color: var(--colors-text);
    border-left: 1px solid;
    font-size: var(--fonts-xl);
    font-weight: bold;
  `,
  BottomRow: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;

    @media only screen and (min-width: 600px) {
      flex-direction: row;
      align-items: flex-end;
    }
  `,
  Infos: styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: 2rem;
    gap: 1rem;

    @media only screen and (min-width: 500px) {
      gap: 2rem;
    }
  `,
  IconButtons: styled.div`
    display: flex;
    gap: 1rem;
  `,
  InfoContainer: styled.div`
    font-size: var(--fonts-xs);

    > label {
      font-weight: bold;
    }
  `,
  IconButton: styled.a`
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
  `,
};
