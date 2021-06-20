import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Checkbox,
  CheckboxGroup,
  Flex,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@chakra-ui/react";
import { Plural, t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { SalmonRunRecordCategory } from "@prisma/client";
import LinkButton from "components/common/LinkButton";
import MyLink from "components/common/MyLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Table";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { useSalmonRunRecords, WeaponsFilter } from "hooks/sr";
import Image from "next/image";
import Link from "next/link";
import { salmonRunStages } from "utils/lists/stages";
import { getRankingString } from "utils/strings";
import MyHead from "../../../components/common/MyHead";
import { salmonRunCategoryToNatural } from "./new";

const SalmonRunLeaderboardsPage = ({}) => {
  const { i18n } = useLingui();
  const { data, isLoading, pendingCount, state, dispatch } =
    useSalmonRunRecords();

  let placement = 1;

  return (
    <>
      <MyHead title={t`Salmon Run Records`} />
      <Flex justify="space-evenly" mb={6}>
        <MyLink prefetch href="/sr/guide/fundamentals">
          Guide (Fundamentals)
        </MyLink>
        <MyLink prefetch href="/sr/guide/advanced">
          Guide (Advanced)
        </MyLink>
        <MyLink isExternal href="https://discord.gg/pXHRffE">
          Overfishing Discord Server
        </MyLink>
      </Flex>
      {pendingCount > 0 && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Plural
            value={pendingCount}
            one={<Trans>You have one record waiting for approval</Trans>}
            other={<Trans>You have # records waiting for approval</Trans>}
          />
        </Alert>
      )}
      <Link href="/sr/leaderboards/new">
        <a>
          <Button size="sm">
            <Trans>Submit result</Trans>
          </Button>
        </a>
      </Link>
      <Box my={4} maxW={80} mx="auto">
        <Select
          value={state.category}
          onChange={(e) =>
            dispatch({
              type: "SET_CATEGORY",
              category: e.target.value as SalmonRunRecordCategory,
            })
          }
        >
          {Object.entries(salmonRunCategoryToNatural).map(([key, value]) => (
            <option key={key} value={key}>
              {i18n._(value)}
            </option>
          ))}
        </Select>
      </Box>

      <Center>
        <RadioGroup
          value={state.stage}
          onChange={(value) =>
            dispatch({ type: "SET_STAGE", stage: value as string })
          }
        >
          <Stack spacing={4} direction={["column", null, "row"]}>
            {salmonRunStages.map((stage) => (
              <Radio key={stage} value={stage}>
                {i18n._(stage)}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </Center>

      <Center my={4}>
        <CheckboxGroup
          value={state.weaponsFilter}
          onChange={(value) =>
            dispatch({
              type: "SET_WEAPONS_FILTER",
              filter: value as WeaponsFilter[],
            })
          }
        >
          <Stack spacing={5} direction={["column", null, "row"]}>
            <Checkbox value="NORMAL">
              <Trans>Normal weapons only</Trans>
            </Checkbox>
            <Checkbox value="ONE_RANDOM">
              <Trans>One random</Trans>
            </Checkbox>
            <Checkbox value="FOUR_RANDOM">
              <Trans>Four random</Trans>
            </Checkbox>
            <Checkbox value="FOUR_RANDOM_GRIZZCO">
              <Trans>Grizzco weapons only</Trans>
            </Checkbox>
          </Stack>
        </CheckboxGroup>
      </Center>

      {isLoading ? null : (
        <>
          <Box mt={8}>
            {data.length === 0 ? (
              <Trans>No results yet. Submit the first one!</Trans>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader />
                    <TableHeader textAlign="center">
                      <Image
                        src="/images/salmonRunIcons/Golden%20Egg.png"
                        width={32}
                        height={32}
                        aria-label="Golden eggs count"
                      />
                    </TableHeader>
                    <TableHeader textAlign="center">
                      <Trans>Weapons</Trans>
                    </TableHeader>
                    <TableHeader textAlign="center">
                      <Trans>Players</Trans>
                    </TableHeader>
                    <TableHeader textAlign="center">
                      <Trans>Rotation Dates</Trans>
                    </TableHeader>
                    <TableHeader textAlign="center">
                      <Trans>Links</Trans>
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((record, i) => {
                    if (
                      i !== 0 &&
                      data[i - 1].goldenEggCount !== record.goldenEggCount
                    ) {
                      placement = i + 1;
                    }
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{getRankingString(placement)}</TableCell>
                        <TableCell fontWeight="bold" textAlign="center">
                          {record.goldenEggCount}
                        </TableCell>
                        <TableCell>
                          <Flex
                            flexDir={["column", null, "row"]}
                            justify="center"
                          >
                            {record.rotation.weapons.map((wpn, i) => (
                              <Box key={i} mx={1}>
                                <WeaponImage size={32} name={wpn} />
                              </Box>
                            ))}
                          </Flex>
                        </TableCell>

                        <TableCell>
                          {record.roster.map((user) => (
                            <Flex
                              key={user.id}
                              align="center"
                              my={4}
                              justify="center"
                            >
                              <MyLink
                                href={`/u/${user.discordId}`}
                                isColored={false}
                              >
                                <UserAvatar isSmall user={user} mr={2} />
                                {user.username}#{user.discriminator}
                              </MyLink>
                            </Flex>
                          ))}
                        </TableCell>

                        <TableCell>
                          <Flex flexDir="column" align="center">
                            <Box
                              as="time"
                              dateTime={
                                record.rotation.startTime as unknown as string
                              }
                            >
                              {new Date(
                                record.rotation.startTime
                              ).toLocaleDateString()}
                            </Box>
                            <Box>-</Box>
                            <Box
                              as="time"
                              dateTime={
                                record.rotation.endTime as unknown as string
                              }
                            >
                              {new Date(
                                record.rotation.endTime
                              ).toLocaleDateString()}
                            </Box>
                          </Flex>
                        </TableCell>

                        <TableCell textAlign="center">
                          {record.links.map((link) => (
                            <LinkButton key={link} link={link} />
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default SalmonRunLeaderboardsPage;
