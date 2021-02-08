import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Switch,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import ChakraSelect from "components/common/ChakraSelect";
import Markdown from "components/common/Markdown";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import SubTextCollapse from "components/common/SubTextCollapse";
import TwitterAvatar from "components/common/TwitterAvatar";
import CreateNewTeamModal from "components/t/CreateNewTeamModal";
import { countries, getEmojiFlag } from "countries-list";
import { useMyTheme, useUser } from "hooks/common";
import { GetStaticProps } from "next";
import Image from "next/image";
import { getAllTeams, GetAllTeamsData } from "prisma/queries/getAllTeams";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

interface Props {
  teams: GetAllTeamsData;
}

const TeamsPage: React.FC<Props> = ({ teams }) => {
  const { gray } = useMyTheme();
  const [user] = useUser();
  const [showOnlyRecruiting, setShowOnlyRecruiting] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [nameFilter, setNameFilter] = useState("");

  const isInTeam = teams.some((team) =>
    team.roster.some((teamMember) => teamMember.id === user?.id)
  );

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Teams` }]} />
      {!isInTeam && <CreateNewTeamModal />}
      {teams.length > 0 && (
        <Box mb={8}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="recruiting" mb="0">
              <Trans>Show only teams that are recruiting</Trans>
            </FormLabel>
            <Switch
              id="recruiting"
              isChecked={showOnlyRecruiting}
              onChange={() => setShowOnlyRecruiting(!showOnlyRecruiting)}
              colorScheme="theme"
            />
          </FormControl>
          <ChakraSelect
            value={countryFilter ?? "ALL"}
            setValue={(value) => {
              if (typeof value === "string") setCountryFilter(value);
            }}
            maxW={64}
            mt={4}
          >
            <option value="ALL">All ({teams.length})</option>
            {teams
              .flatMap((team) =>
                Array.from(
                  new Set(team.roster.map((user) => user.profile?.country))
                )
              )
              .reduce((acc: [string, number][], cur) => {
                if (!cur) return acc;
                const countryTuple = acc.find(([country]) => country === cur);
                if (!countryTuple) acc.push([cur, 1]);
                else countryTuple[1]++;

                return acc;
              }, [])
              .sort((a, b) => b[1] - a[1])
              .map(([country, count]) => (
                <option key={country} value={country}>
                  {
                    Object.entries(countries).find(
                      ([key]) => key === country
                    )![1].name
                  }{" "}
                  ({count})
                </option>
              ))}
          </ChakraSelect>
          <InputGroup maxW={64} mt={6} mb={6}>
            <InputLeftElement
              pointerEvents="none"
              children={<Box as={FiSearch} color={gray} />}
            />
            <Input
              placeholder="Team Olive"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </InputGroup>
        </Box>
      )}
      {teams
        .filter((team) => {
          if (showOnlyRecruiting && !team.recruitingPost) return false;
          if (countryFilter !== "ALL") {
            return team.roster.some(
              (user) => user.profile?.country === countryFilter
            );
          }
          if (nameFilter) {
            return team.name.toLowerCase().includes(nameFilter.toLowerCase());
          }

          return true;
        })
        .map((team, i, arr) => (
          <Box key={team.id}>
            <Flex align="center">
              {team.twitterName && (
                <MyLink href={`/t/${team.nameForUrl}`} isColored={false}>
                  <TwitterAvatar mr={2} twitterName={team.twitterName} />
                </MyLink>
              )}
              <MyLink href={`/t/${team.nameForUrl}`} isColored={false}>
                <Box fontSize="2rem" fontWeight="bold">
                  {team.name}
                </Box>
              </MyLink>

              <Box ml={2}>
                {team.countries
                  .map((country) => getEmojiFlag(country))
                  .join("  ")}
              </Box>
            </Flex>
            <Box color={gray} fontSize="sm" mt={2}>
              {team.roster
                .map((user) => `${user.username}#${user.discriminator}`)
                .join(", ")}
            </Box>
            {team.teamXP > 2000 && (
              <Flex align="center" mt={2}>
                <Image src={`/layout/xsearch.png`} height={24} width={24} />
                <SubText ml={1}>
                  {team.teamXP.toFixed(1).replace(".0", "")}
                </SubText>
              </Flex>
            )}
            {team.recruitingPost && (
              <SubTextCollapse title={t`Recruiting post`} mt={4}>
                <Markdown value={team.recruitingPost} smallHeaders />
              </SubTextCollapse>
            )}
            {i + 1 !== arr.length && <Divider my={6} />}
          </Box>
        ))}
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const teams = await getAllTeams();

  return {
    props: {
      teams: teams.sort((a, b) => b.teamXP - a.teamXP),
    },
    revalidate: 1,
  };
};

export default TeamsPage;
