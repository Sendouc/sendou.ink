import { Box, Flex, Heading, Wrap, WrapItem } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import LinkButton from "components/common/LinkButton";
import MyContainer from "components/common/MyContainer";
import MyLink from "components/common/MyLink";
import Section from "components/common/Section";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import WeaponImage from "components/common/WeaponImage";
import { salmonRunStages } from "lib/lists/stages";
import { useMyTheme } from "lib/useMyTheme";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { salmonRunCategoryToNatural } from "pages/sr/leaderboards/new";
import {
  getUsersSalmonRunRecords,
  GetUsersSalmonRunRecordsData,
} from "prisma/queries/getUsersSalmonRunRecords";

interface Props {
  user: GetUsersSalmonRunRecordsData;
}

const SalmonRunPlayerPage = (props: Props) => {
  const { gray } = useMyTheme();
  const user = props.user!;

  return (
    <MyContainer>
      <Breadcrumbs
        pages={[
          { name: t`Salmon Run` },
          { name: `${user.username}#${user.discriminator}` },
        ]}
      />
      <Flex align="center">
        <UserAvatar user={user} size="xl" mr={4} />
        <Box>
          <Box
            fontSize="2rem"
            fontWeight="bold
        "
          >
            {user.username}#{user.discriminator}
          </Box>
          <SubText ml="1px" mt="-6px">
            <Trans>Salmon Run Records</Trans>
          </SubText>
        </Box>
      </Flex>
      <Box>
        {Object.keys(salmonRunCategoryToNatural)
          .filter((key) =>
            user.salmonRunRecords.some((record) => record.category === key)
          )
          .map((category) => {
            return (
              <Box key={category} mt={4}>
                <Heading as="h2" size="md" fontFamily="'Rubik', sans-serif">
                  {/* @ts-ignore */}
                  {salmonRunCategoryToNatural[category]}
                </Heading>
                <Wrap spacing={4} mt={4}>
                  {salmonRunStages
                    .filter((stage) =>
                      user.salmonRunRecords.some(
                        (record) =>
                          record.category === category &&
                          record.rotation.stage === stage
                      )
                    )
                    .map(
                      (stage) =>
                        user.salmonRunRecords.find(
                          (record) =>
                            record.category === category &&
                            record.rotation.stage === stage
                        )!
                    )
                    .map((record) => (
                      <WrapItem key={record.id}>
                        <Section>
                          <SubText mb={2} mt={2}>
                            {record.rotation.stage}
                          </SubText>
                          <Box color={gray} fontSize="sm" my={2}>
                            {new Date(
                              record.rotation.startTime
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              record.rotation.endTime
                            ).toLocaleDateString()}
                          </Box>
                          <Flex align="center" my={2}>
                            <Box mr={1} fontSize="1.25rem" fontWeight="bold">
                              {record.goldenEggCount}
                            </Box>
                            <Image
                              src="/layout/sr.png"
                              height={30}
                              width={30}
                              alt="SR"
                              priority
                            />
                          </Flex>
                          <Flex my={2}>
                            {record.rotation.weapons.map((wpn, i) => (
                              <Box key={i} mr={1}>
                                <WeaponImage size={32} name={wpn} />
                              </Box>
                            ))}
                          </Flex>
                          {record.roster.length > 1 && (
                            <Flex my={2}>
                              {record.roster
                                .filter(
                                  (rosterUser) =>
                                    rosterUser.discordId !== user.discordId
                                )
                                .map((user) => (
                                  <Box key={user.discordId} mr={1}>
                                    <MyLink href={`/u/${user.discordId}`}>
                                      <UserAvatar user={user} isSmall mr={1} />
                                    </MyLink>
                                  </Box>
                                ))}
                            </Flex>
                          )}
                          <Flex mt={2}>
                            {record.links.map((link) => (
                              <LinkButton link={link} />
                            ))}
                          </Flex>
                        </Section>
                      </WrapItem>
                    ))}
                </Wrap>
              </Box>
            );
          })}
      </Box>
    </MyContainer>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const user = await getUsersSalmonRunRecords(parseInt(params!.id as string));

  if (!user || !user.salmonRunRecords.length) return { notFound: true };

  const categoryStages = new Set<string>();

  user.salmonRunRecords = user.salmonRunRecords
    .sort((a, b) => b.goldenEggCount - a.goldenEggCount)
    .filter((record) => {
      if (!record.approved) return false;

      const id = record.category + record.rotation.stage;
      if (categoryStages.has(id)) return false;

      categoryStages.add(id);
      return true;
    });

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
    revalidate: 1,
  };
};

export default SalmonRunPlayerPage;
