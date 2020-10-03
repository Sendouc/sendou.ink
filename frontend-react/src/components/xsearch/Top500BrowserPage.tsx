import { Avatar, Box, Flex, Link as ChakraLink, Text } from "@chakra-ui/core";
import { Link, RouteComponentProps } from "@reach/router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GetPeakXPowerLeaderboardDocument,
  GetXRankPlacementsInput,
  useGetXRankPlacementsQuery,
} from "../../generated/graphql";
import MyThemeContext from "../../themeContext";
import { Weapon } from "../../types";
import Error from "../common/Error";
import PageHeader from "../common/PageHeader";
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

export const Top500Browser: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<GetXRankPlacementsInput>({});
  const [page, setPage] = useState(1);
  const {
    previousData,
    data = previousData,
    error,
    client,
  } = useGetXRankPlacementsQuery({
    variables: { page, filter },
  });
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext);

  client.query({
    query: GetPeakXPowerLeaderboardDocument,
    variables: { page: page + 1, weapon: ".96 Gal" },
  });

  if (error) return <Error errorMessage={error.message} />;

  return (
    <>
      <PageHeader title="Top 500 Browser" />
      <Box my={4}>
        <Pagination
          currentPage={page}
          pageCount={data?.getXRankPlacements.pageCount ?? 1}
          onChange={setPage}
        />
      </Box>
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Weapon</TableHeader>
            <TableHeader>X Power</TableHeader>
            <TableHeader>Ranking</TableHeader>
            <TableHeader>Mode</TableHeader>
            <TableHeader>Month</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data &&
            data.getXRankPlacements.records.map((record) => {
              return (
                <TableRow key={record.id}>
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
                        {record.playerName}
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
                  <TableCell color={grayWithShade}>{record.ranking}</TableCell>
                  <TableCell>{record.mode}</TableCell>
                  <TableCell color={grayWithShade}>
                    {record.month}/{record.year}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <Box my={4}>
        <Pagination
          currentPage={page}
          pageCount={data?.getXRankPlacements.pageCount ?? 1}
          onChange={setPage}
          scrollToTop
        />
      </Box>
    </>
  );
};

export default Top500Browser;
