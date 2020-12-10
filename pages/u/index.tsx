import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import { getEmojiFlag } from "countries-list";
import { Unpacked } from "lib/types";
import { useDebounce } from "lib/useDebounce";
import { useMyTheme } from "lib/useMyTheme";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAllUsers, GetAllUsersData } from "prisma/queries/getAllUsers";
import { useEffect, useMemo, useState } from "react";
import { FaTwitter } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

interface Props {
  users: GetAllUsersData;
}

const UserSearchPage = ({ users }: Props) => {
  const router = useRouter();
  const { gray } = useMyTheme();

  const [filter, setFilter] = useState(getInitialFilterValue());
  const debouncedFilter = useDebounce(filter);

  useEffect(() => {
    if (debouncedFilter.length < 3) {
      router.push(`/u`, undefined, { shallow: true });
    } else {
      router.push(`/u?filter=${debouncedFilter}`, undefined, { shallow: true });
    }
  }, [debouncedFilter]);

  const filteredUsers = useMemo(() => {
    if (debouncedFilter.length < 3) return [];

    return users.filter((u) => {
      const normalizedFilter = debouncedFilter.toLowerCase();
      const normalizedName = `${u.username}#${u.discriminator}`.toLowerCase();

      if (normalizedName.includes(normalizedFilter)) return true;

      const normalizedTwitter = u.profile?.twitterName
        ? u.profile.twitterName.toLowerCase()
        : "";

      if (normalizedTwitter.includes(normalizedFilter)) return true;

      return false;
    });
  }, [debouncedFilter]);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <Breadcrumbs pages={[{ name: t`Users` }]} />
      <Box color={gray} fontSize="sm" mb={4}>
        <Trans>Search for users by their Discord tag or Twitter name</Trans>
      </Box>
      <InputGroup size="lg" maxW={80} mt={4} mb={6}>
        <InputLeftElement
          pointerEvents="none"
          children={<Box as={FiSearch} color={gray} />}
        />
        <Input
          placeholder="Sendou#4059"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </InputGroup>
      <Box mt={4}>
        {filteredUsers.map((user) => (
          <UserInfo key={user.discordId} user={user} />
        ))}
      </Box>
      {debouncedFilter.length >= 3 && !filteredUsers.length && (
        <Box>No matching users found</Box>
      )}
    </>
  );

  function getInitialFilterValue() {
    if (!router.query.filter || typeof router.query.filter !== "string")
      return "";

    return router.query.filter;
  }
};

function UserInfo({ user }: { user: Unpacked<GetAllUsersData> }) {
  return (
    <Flex my={6} align="center">
      <Link href={`/u/${user.discordId}`}>
        <a>
          <UserAvatar isSmall user={user} />
        </a>
      </Link>
      <Box ml={4}>
        <Box fontWeight="bold">
          <MyLink href={`/u/${user.discordId}`} isColored={false}>
            {user.username}#{user.discriminator}
          </MyLink>
          {user.profile?.country ? (
            <Box as="span" ml={2}>
              {getEmojiFlag(user.profile.country)}
            </Box>
          ) : null}
        </Box>
        {user.profile?.twitterName && (
          <Flex align="center" fontSize="sm" mt={1}>
            <Box as={FaTwitter} color="#00acee" mr={1} />
            <MyLink
              isExternal
              href={`https://twitter.com/${user.profile.twitterName}`}
              isColored={false}
            >
              {user.profile.twitterName}
            </MyLink>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  await getAllUsers();

  return { props: { users: await getAllUsers() }, revalidate: 3600 };
};

export default UserSearchPage;
