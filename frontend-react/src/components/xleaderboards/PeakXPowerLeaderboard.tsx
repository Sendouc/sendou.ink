import { Avatar, Box, Flex, Link as ChakraLink, Text } from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GetPeakXPowerLeaderboardDocument,
  useGetPeakXPowerLeaderboardQuery,
} from "../../generated/graphql";
import MyThemeContext from "../../themeContext";
import { Weapon } from "../../types";
import { getPlacementString } from "../../utils/helperFunctions";
import Error from "../common/Error";
import Pagination from "../common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../common/Table";
import WeaponImage from "../common/WeaponImage";

interface PeakXPowerLeaderboardProps {
  weapon?: Weapon;
}

export const PeakXPowerLeaderboard: React.FC<PeakXPowerLeaderboardProps> = ({
  weapon,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const {
    previousData,
    data = previousData,
    error,
    client,
  } = useGetPeakXPowerLeaderboardQuery({
    variables: { weapon, page },
  });
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext);

  client.query({
    query: GetPeakXPowerLeaderboardDocument,
    variables: { page: page + 1, weapon },
  });

  if (error) return <Error errorMessage={error.message} />;

  return (
    <>
      <Box my={4}>
        <Pagination
          currentPage={page}
          pageCount={data?.getPeakXPowerLeaderboard.pageCount ?? 1}
          onChange={setPage}
        />
      </Box>
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            {page === 1 && <TableHeader></TableHeader>}
            <TableHeader>Name</TableHeader>
            <TableHeader>Weapon</TableHeader>
            <TableHeader>X Power</TableHeader>
            <TableHeader>Month</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data &&
            data.getPeakXPowerLeaderboard.records.map(
              (record, index, allRecords) => {
                return (
                  <TableRow key={record.id}>
                    {page === 1 && (
                      <TableCell>
                        {(index === 0 ||
                          record.xPower !== allRecords[index - 1].xPower) && (
                          <Text fontWeight="bold" fontSize="sm">
                            {getPlacementString(index + 1)}
                          </Text>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {record.user ? (
                        <Flex alignItems="center">
                          <ChakraLink
                            as={Link}
                            color={themeColorWithShade}
                            to={record.user.profilePath}
                          >
                            <Avatar
                              src={record.user.avatarUrl}
                              size="sm"
                              name={record.user.fullUsername}
                              mr="0.5rem"
                            />
                          </ChakraLink>
                          {record.user.fullUsername}
                        </Flex>
                      ) : (
                        <>{record.playerName}</>
                      )}
                    </TableCell>
                    <TableCell>
                      <WeaponImage
                        englishName={record.weapon as Weapon}
                        size="SMALL"
                      />
                    </TableCell>
                    <TableCell>
                      <Text fontWeight="bold">{record.xPower}</Text>
                    </TableCell>
                    <TableCell color={grayWithShade}>
                      {record.month}/{record.year}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
        </TableBody>
      </Table>
      <Box my={4}>
        <Pagination
          currentPage={page}
          pageCount={data?.getPeakXPowerLeaderboard.pageCount ?? 1}
          onChange={setPage}
          scrollToTop
        />
      </Box>
    </>
  );
};
