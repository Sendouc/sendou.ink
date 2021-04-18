import MyLink from "components/common/MyLink";
import NewTable from "components/common/NewTable";
import WeaponImage from "components/common/WeaponImage";
import { Top500PlacementsByMonth } from "services/xsearch";
import { getRankingString } from "utils/strings";

interface Props {
  placements: Top500PlacementsByMonth;
}

const Top500Table: React.FC<Props> = ({ placements }) => {
  return (
    <NewTable
      headers={[
        { name: "rank", dataKey: "ranking" },
        { name: "name", dataKey: "name" },
        { name: "x power", dataKey: "xPower" },
        { name: "weapon", dataKey: "weapon" },
      ]}
      data={placements.map((placement) => {
        return {
          id: placement.ranking,
          name: (
            <MyLink
              href={`/player/${placement.player.switchAccountId}`}
              isColored={false}
            >
              {placement.playerName}
            </MyLink>
          ),
          ranking: getRankingString(placement.ranking),
          xPower: placement.xPower,
          weapon: <WeaponImage size={32} name={placement.weapon} />,
        };
      })}
    />
  );
};

export default Top500Table;
