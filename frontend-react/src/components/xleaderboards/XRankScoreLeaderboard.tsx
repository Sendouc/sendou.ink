import { Avatar, Link as ChakraLink, Text } from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetXRankLeaderboardQuery,
  XRankLeaderboardType,
} from "../../generated/graphql";
import MyThemeContext from "../../themeContext";
import { getPlacementString } from "../../utils/helperFunctions";
import Error from "../common/Error";
import Loading from "../common/Loading";
import Pagination from "../common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../common/Table";

interface PeakXPowerLeaderboardProps {
  type: XRankLeaderboardType;
}

const XRankScoreLeaderboard: React.FC<PeakXPowerLeaderboardProps> = ({
  type,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, error } = useGetXRankLeaderboardQuery({
    variables: { type, page },
  });
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext);

  if (error) return <Error errorMessage={error.message} />;
  if (!data) return <Loading />;

  return (
    <>
      <Pagination
        currentPage={page}
        pageCount={data.getXRankLeaderboard.pageCount}
        onChange={setPage}
      />
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            <TableHeader></TableHeader>
            <TableHeader p={0}></TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Score</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.getXRankLeaderboard.records.map((record, index, allRecords) => {
            return (
              <TableRow key={record.playerId}>
                <TableCell>
                  {page === 1 &&
                    (index === 0 ||
                      record.score !== allRecords[index - 1].score) && (
                      <Text fontWeight="bold" fontSize="sm">
                        {getPlacementString(index + 1)}
                      </Text>
                    )}
                </TableCell>
                <TableCell p={0}>
                  {record.user?.avatarUrl && (
                    <Avatar
                      src={record.user.avatarUrl}
                      size="sm"
                      name={record.user.fullUsername}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {record.user ? (
                    <ChakraLink
                      as={Link}
                      color={themeColorWithShade}
                      to={record.user.profilePath}
                    >
                      {record.user?.fullUsername}
                    </ChakraLink>
                  ) : (
                    <>{record.playerName}</>
                  )}
                </TableCell>
                <TableCell>{record.score}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default XRankScoreLeaderboard;
