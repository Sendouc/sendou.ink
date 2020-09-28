import { Avatar, Link as ChakraLink, Text } from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext, useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetPeakXPowerLeaderboardQuery } from "../../generated/graphql"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { getPlacementString } from "../../utils/helperFunctions"
import Error from "../common/Error"
import Loading from "../common/Loading"
import Pagination from "../common/Pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../common/Table"
import WeaponImage from "../common/WeaponImage"

interface PeakXPowerLeaderboardProps {
  weapon?: Weapon
}

export const PeakXPowerLeaderboard: React.FC<PeakXPowerLeaderboardProps> = ({
  weapon,
}) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, error } = useGetPeakXPowerLeaderboardQuery({
    variables: { weapon, page },
  })
  const { grayWithShade, themeColorWithShade } = useContext(MyThemeContext)

  if (error) return <Error errorMessage={error.message} />
  if (!data) return <Loading />

  return (
    <>
      {/*
      <Pagination
        currentPage={page}
        pageCount={data.getPeakXPowerLeaderboard.pageCount}
        onChange={setPage}
      />
      {data.getPeakXPowerLeaderboard.records.map((record) => {
        return (
          <Section my="2rem">
            <Box fontSize="1.5rem">{record.playerName}</Box>{" "}
            <Flex alignItems="center" mt="1rem">
              <WeaponImage
                englishName={record.weapon as Weapon}
                size="MEDIUM"
              />
              <Box fontWeight="bold" fontSize="1.3rem" ml="1rem">
                {record.xPower}
              </Box>
            </Flex>
          </Section>
        )
      })}
      <Pagination
        currentPage={page}
        pageCount={data.getPeakXPowerLeaderboard.pageCount}
        onChange={setPage}
      />
    */}
      <Pagination
        currentPage={page}
        pageCount={data.getPeakXPowerLeaderboard.pageCount}
        onChange={setPage}
      />
      <Table maxW="50rem">
        <TableHead>
          <TableRow>
            <TableHeader></TableHeader>
            <TableHeader p={0}></TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Weapon</TableHeader>
            <TableHeader>X Power</TableHeader>
            <TableHeader>Month</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.getPeakXPowerLeaderboard.records.map(
            (record, index, allRecords) => {
              return (
                <TableRow>
                  <TableCell>
                    {page === 1 &&
                      (index === 0 ||
                        record.xPower !== allRecords[index - 1].xPower) && (
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
              )
            }
          )}
        </TableBody>
      </Table>
    </>
  )
}
