import { Text } from "@chakra-ui/core"
import React, { useContext, useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetPeakXPowerLeaderboardQuery } from "../../generated/graphql"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { getPlacementString } from "../../utils/helperFunctions"
import Error from "../common/Error"
import Loading from "../common/Loading"
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
  const { darkerBgColor, bgColor, grayWithShade } = useContext(MyThemeContext)

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
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader></TableHeader>
            <TableHeader></TableHeader>
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
                <TableRow bg={index % 2 === 0 ? "white" : "gray.50"}>
                  <TableCell>
                    {page === 1 &&
                      (index === 0 ||
                        record.xPower !== allRecords[index - 1].xPower) && (
                        <Text fontWeight="bold" fontSize="sm">
                          {getPlacementString(index + 1)}
                        </Text>
                      )}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <Text fontWeight="bold">{record.playerName}</Text>
                  </TableCell>
                  <TableCell>
                    <WeaponImage
                      englishName={record.weapon as Weapon}
                      size="SMALL"
                    />
                  </TableCell>
                  <TableCell>{record.xPower}</TableCell>
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
