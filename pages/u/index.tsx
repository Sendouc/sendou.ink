import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import Flag from "components/common/Flag";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import { useDebounce, useMyTheme } from "hooks/common";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAllUsers, GetAllUsersData } from "prisma/queries/getAllUsers";
import { useEffect, useMemo, useState } from "react";
import { FaTwitter } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Unpacked } from "utils/types";
import MyHead from "../../components/common/MyHead";

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
      router.replace("/u", undefined, { shallow: true });
    } else {
      router.replace(
        `?filter=${encodeURIComponent(debouncedFilter)}`,
        undefined,
        { shallow: true }
      );
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
      <MyHead title={t`User Search`} />
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <InputGroup size="lg" maxW={80} mt={4} mb={6} mx="auto">
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
    <Flex my={3} align="center">
      <Link href={`/u/${user.discordId}`}>
        <a>
          <UserAvatar isSmall user={user} />
        </a>
      </Link>
      <Box ml={4}>
        <Flex align="center" fontWeight="bold">
          <MyLink
            href={`/u/${user.discordId}`}
            isColored={false}
            prefetch={true}
          >
            {user.username}#{user.discriminator}
          </MyLink>
          {user.profile?.country ? (
            <Box ml={2} mt={2}>
              <Flag countryCode={user.profile.country} />
            </Box>
          ) : null}
        </Flex>
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
