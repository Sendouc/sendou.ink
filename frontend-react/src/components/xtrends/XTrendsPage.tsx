import { useQuery } from "@apollo/react-hooks"
import {
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import { XTrendsData, X_TRENDS } from "../../graphql/queries/xTrends"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { parseAndGetLocalizedMonthYear } from "../../utils/helperFunctions"
import { months, weapons } from "../../utils/lists"
import Error from "../common/Error"
import Loading from "../common/Loading"
import PageHeader from "../common/PageHeader"
import Section from "../common/Section"
import WeaponImage from "../common/WeaponImage"
import Select from "../elements/Select"
import ModeButtons from "./ModeButtons"
import WeaponLineChart from "./WeaponLineChart"

const tiers = [
  {
    label: "X",
    criteria: 6,
    color: "purple.700",
  },
  {
    label: "S+",
    criteria: 5,
    color: "red.700",
  },
  {
    label: "S",
    criteria: 4,
    color: "red.700",
  },
  {
    label: "A+",
    criteria: 3,
    color: "orange.700",
  },
  {
    label: "A",
    criteria: 2,
    color: "orange.700",
  },
  {
    label: "B+",
    criteria: 1.5,
    color: "yellow.700",
  },
  {
    label: "B",
    criteria: 1,
    color: "yellow.700",
  },
  {
    label: "C+",
    criteria: 0.5,
    color: "green.700",
  },
  {
    label: "C",
    criteria: 0.002, //1 in 500
    color: "green.700",
  },
] as const

const modeTranslationKey = new Map([
  ["SZ", "splatZonesShort"],
  ["TC", "towerControlShort"],
  ["RM", "rainMakerShort"],
  ["CB", "clamBlitzShort"],
])

const XTrendsPage: React.FC<RouteComponentProps> = () => {
  const { t, i18n } = useTranslation()
  const { grayWithShade, darkerBgColor, themeColorWithShade } = useContext(
    MyThemeContext
  )
  const { data, error, loading } = useQuery<XTrendsData>(X_TRENDS)
  const [month, setMonth] = useState<string | null>(null)
  const [mode, setMode] = useState<"SZ" | "TC" | "RM" | "CB">("SZ")
  const [weaponMonths, setWeaponMonths] = useState<Record<
    string,
    Record<"SZ" | "TC" | "RM" | "CB", { name: Weapon; amount: number }[]>
  > | null>(null)

  useEffect(() => {
    if (loading || error || !!weaponMonths) return

    const newWeaponMonths: Record<
      string,
      Record<"SZ" | "TC" | "RM" | "CB", { name: Weapon; amount: number }[]>
    > = {}
    data!.xTrends.forEach((weaponObj) => {
      weaponObj.counts.forEach((count) => {
        const arrays = [count.SZ, count.TC, count.RM, count.CB]
        arrays.forEach((arr, modeIndex) => {
          const modes = ["SZ", "TC", "RM", "CB"] as const
          const mode = modes[modeIndex]
          arr.forEach((num, numIndex) => {
            if (num === null || num === 0) return
            const monthString = `${months[numIndex]} ${count.year}`
            if (!newWeaponMonths[monthString]) {
              newWeaponMonths[monthString] = { SZ: [], TC: [], RM: [], CB: [] }
            }
            let weaponMonth = newWeaponMonths[monthString][mode]
            weaponMonth.push({ name: weaponObj.weapon as Weapon, amount: num })
            newWeaponMonths[monthString][mode] = weaponMonth
          })
        })
      })
    })

    setWeaponMonths(newWeaponMonths)
  }, [data, loading, error, weaponMonths])

  if (error) return <Error errorMessage={error.message} />
  if (loading || !weaponMonths) return <Loading />

  const xRankMonths = Object.keys(weaponMonths).sort((a, b) => {
    const partsA = a.split(" ")
    const partsB = b.split(" ")
    if (partsA[1] !== partsB[1]) {
      return parseInt(partsB[1]) - parseInt(partsA[1])
    }

    return months.indexOf(partsB[0] as any) - months.indexOf(partsA[0] as any)
  })

  if (!month) setMonth(xRankMonths[0])

  const weaponsOrdered = month
    ? weaponMonths[month][mode].sort((a, b) => {
        const comparision = b.amount - a.amount

        if (comparision !== 0) return comparision

        return weapons.indexOf(a.name) - weapons.indexOf(b.name)
      })
    : []

  return (
    <>
      <PageHeader title="Top 500 Tier Lists" />
      <Helmet>
        <title>{t("navigation;Top 500 Tier Lists")} | sendou.ink</title>
      </Helmet>
      <Select
        value={
          month
            ? {
                label: parseAndGetLocalizedMonthYear(month, i18n.language),
                value: month,
              }
            : null
        }
        setValue={(value) => setMonth(value)}
        options={xRankMonths.map((month) => ({
          label: parseAndGetLocalizedMonthYear(month, i18n.language),
          value: month,
        }))}
      />
      <Box my="1em">
        <ModeButtons
          mode={mode}
          setMode={(mode) => setMode(mode as "SZ" | "TC" | "RM" | "CB")}
        />
      </Box>
      <Box my={10} color={grayWithShade}>
        {t("xtrends;trendsExplanation")}
      </Box>
      {tiers.map((tier, index, tiers) => (
        <Section key={tier.criteria} display="flex" my={4}>
          <Flex
            flexDir="column"
            w="80px"
            minH="100px"
            px="10px"
            borderRight="5px solid"
            borderColor={tier.color}
            marginRight="1em"
            justifyContent="center"
          >
            <Box fontSize="2em" fontWeight="bolder">
              {tier.label}
            </Box>
            <Box color={grayWithShade}>
              {tier.criteria === 0.002 ? ">0%" : `${tier.criteria}%`}
            </Box>
          </Flex>
          <Flex
            flexDir="row"
            flex={1}
            flexWrap="wrap"
            alignItems="center"
            py="1em"
          >
            {weaponsOrdered
              .filter((weapon) => {
                const previousCriteria =
                  index === 0 ? 101 : tiers[index - 1].criteria
                const percentsInTop500 = weapon.amount / 5
                return (
                  percentsInTop500 < previousCriteria &&
                  percentsInTop500 >= tier.criteria
                )
              })
              .map((weapon) => (
                <Popover key={weapon.name} placement="top-start">
                  <PopoverTrigger>
                    <Box m="0.5em" cursor="pointer">
                      <WeaponImage
                        englishName={weapon.name}
                        size="MEDIUM"
                        noTitle
                      />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent zIndex={4} p="0.5em" bg={darkerBgColor}>
                    <PopoverArrow />
                    <Flex flexDir="column" alignItems="center">
                      <Box
                        as="span"
                        borderBottom="2px solid"
                        borderColor={themeColorWithShade}
                        fontWeight="bolder"
                        fontSize="1.2em"
                        mb="0.5em"
                        textAlign="center"
                      >
                        {t("game;" + weapon.name)} (
                        {t("plans;" + modeTranslationKey.get(mode))})
                      </Box>
                      <WeaponLineChart
                        counts={
                          data!.xTrends.find(
                            (weaponObj) => weaponObj.weapon === weapon.name
                          )!.counts
                        }
                        mode={mode}
                        lastMonthYear={xRankMonths[0]}
                      />
                    </Flex>
                  </PopoverContent>
                </Popover>
              ))}
          </Flex>
        </Section>
      ))}
    </>
  )
}

export default XTrendsPage
