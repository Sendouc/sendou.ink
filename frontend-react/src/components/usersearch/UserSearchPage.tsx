import React, { useContext, useState, useEffect } from "react"
import { useQuery } from "@apollo/react-hooks"
import { RouteComponentProps, Link } from "@reach/router"
import { USERS, UsersData } from "../../graphql/queries/users"
import Error from "../common/Error"
import Loading from "../common/Loading"
import { Box, Flex } from "@chakra-ui/core"
import UserAvatar from "../common/UserAvatar"
import { FaTwitter } from "react-icons/fa"
import MyThemeContext from "../../themeContext"
import PageHeader from "../common/PageHeader"
import { Helmet } from "react-helmet-async"
import Input from "../elements/Input"
import Pagination from "../common/Pagination"
import { useTranslation } from "react-i18next"

const UserSearchPage: React.FC<RouteComponentProps> = () => {
  const { darkerBgColor } = useContext(MyThemeContext)
  const { t } = useTranslation()
  const { data, error, loading } = useQuery<UsersData>(USERS)
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  if (error) return <Error errorMessage={error.message} />
  if (loading) return <Loading />

  const usersFiltered =
    filter === ""
      ? data!.users
      : data!.users.filter((user) => {
          const filterLower = filter.toLowerCase()
          if (user.discord_id.includes(filterLower)) return true

          if (
            `${user.username}#${user.discriminator}`
              .toLowerCase()
              .includes(filterLower)
          )
            return true

          if (
            user.twitter_name &&
            user.twitter_name.toLowerCase().includes(filterLower)
          )
            return true

          return false
        })

  const usersSliced = usersFiltered.slice(
    20 * (currentPage - 1),
    20 * (currentPage - 1) + 20
  )

  return (
    <>
      <PageHeader title={t("navigation;User Search")} />
      <Helmet>
        <title>{t("navigation;User Search")} | sendou.ink</title>
      </Helmet>
      <Box my="1em">
        <Input
          size="lg"
          label={t("users;Filter by username, Twitter name or Discord ID")}
          value={filter}
          setValue={(value: string) => setFilter(value)}
        />
      </Box>
      <Pagination
        currentPage={currentPage}
        pageCount={Math.ceil(usersFiltered.length / 20)}
        onChange={(page: number) => setCurrentPage(page)}
      />
      <Box>
        {usersSliced.map((user) => (
          <Link key={user.discord_id} to={`/u/${user.discord_id}`}>
            <Box
              borderRadius="5px"
              p="10px"
              _hover={{ bg: darkerBgColor }}
              transition="0.5s all"
            >
              <Flex key={user.discord_id} alignItems="center">
                <UserAvatar name={user.username} src={user.avatar} />{" "}
                <Flex flexDir="column" ml="0.5em">
                  <Box fontWeight="bold" fontSize="1.1em">
                    {user.username}#{user.discriminator}
                  </Box>
                  {user.twitter_name && (
                    <Flex alignItems="center">
                      <Box as={FaTwitter} mr="0.3em" />
                      {user.twitter_name}
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Box>
          </Link>
        ))}
      </Box>
      <Pagination
        currentPage={currentPage}
        pageCount={Math.ceil(usersFiltered.length / 20)}
        onChange={(page: number) => setCurrentPage(page)}
      />
    </>
  )
}

export default UserSearchPage
