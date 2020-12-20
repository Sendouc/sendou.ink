import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@chakra-ui/react";
import { Plural, t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { SalmonRunRecordCategory } from "@prisma/client";
import Breadcrumbs from "components/common/Breadcrumbs";
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
import { useSalmonRunRecords } from "hooks/sr";
import { salmonRunStages } from "lib/lists/stages";
import { getRankingString } from "lib/strings";
import Image from "next/image";
import Link from "next/link";
import { FiLink, FiTwitter, FiYoutube } from "react-icons/fi";
import { salmonRunCategoryToNatural } from "./new";

const SalmonRunLeaderboardsPage = ({}) => {
  const { i18n } = useLingui();
  const {
    data,
    isLoading,
    pendingCount,
    state,
    dispatch,
  } = useSalmonRunRecords();

  let placement = 1;

  return (
    <>
      <Breadcrumbs
        pages={[{ name: t`Salmon Run` }, { name: t`Leaderboards` }]}
      />
      {pendingCount > 0 && (
        <Alert status="info" my={4}>
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
          <Button variant="outline">
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

      <Box mt={8}>
        {data.length === 0 && !isLoading ? (
          <Trans>No results yet. Submit the first one!</Trans>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader />
                <TableHeader>
                  <Image
                    src="/images/salmonRunIcons/Golden%20Egg.png"
                    width={32}
                    height={32}
                    aria-label="Golden eggs count"
                  />
                </TableHeader>
                <TableHeader>
                  <Trans>Weapons</Trans>
                </TableHeader>
                <TableHeader>
                  <Trans>Players</Trans>
                </TableHeader>
                <TableHeader>
                  <Trans>Rotation Dates</Trans>
                </TableHeader>
                <TableHeader>
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
                    <TableCell fontWeight="bold">
                      {record.goldenEggCount}
                    </TableCell>
                    <TableCell>
                      <Flex flexDir={["column", null, "row"]}>
                        {record.rotation.weapons.map((wpn) => (
                          <Box key={wpn} mx={1}>
                            <WeaponImage size={32} name={wpn} />
                          </Box>
                        ))}
                      </Flex>
                    </TableCell>

                    <TableCell>
                      {record.roster.map((user) => (
                        <Flex key={user.id} align="center" my={4}>
                          <UserAvatar isSmall user={user} mr={2} />
                          {user.username}#{user.discriminator}
                        </Flex>
                      ))}
                    </TableCell>

                    <TableCell>
                      <Box
                        as="time"
                        dateTime={
                          (record.rotation.startTime as unknown) as string
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
                          (record.rotation.endTime as unknown) as string
                        }
                      >
                        {new Date(record.rotation.endTime).toLocaleDateString()}
                      </Box>
                    </TableCell>

                    <TableCell>
                      {record.links.map((link) => (
                        <IconButton
                          key={link}
                          aria-label={`Link to ${link}`}
                          icon={<LinkIcon link={link} />}
                          isRound
                          variant="ghost"
                        />
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
  );
};

function LinkIcon({ link }: { link: string }) {
  if (link.includes("youtube") || link.includes("youtu.be")) {
    return <FiYoutube />;
  }

  if (link.includes("twitter")) {
    return <FiTwitter />;
  }

  return <FiLink />;
}

export default SalmonRunLeaderboardsPage;
