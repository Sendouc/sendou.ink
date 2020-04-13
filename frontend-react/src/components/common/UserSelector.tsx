import React from "react"
import { useQuery } from "@apollo/react-hooks"
import { USERS, UsersData } from "../../graphql/queries/users"
import Error from "./Error"
import Select from "../elements/Select"

interface UserSelectorProps {
  id?: string
  setValue?: (value: string) => void
}

const UserSelector: React.FC<UserSelectorProps> = ({ setValue }) => {
  const { data, error, loading } = useQuery<UsersData>(USERS)

  if (error) return <Error errorMessage={error.message} />
  return (
    <>
      <Select
        isSearchable
        options={
          !loading && data
            ? data.users.map((user) => ({
                label: `${user.username}#${user.discriminator}`,
                value: user.discord_id,
              }))
            : undefined
        }
        setValue={setValue}
        clearable
        hideMenuBeforeTyping
        isLoading={loading}
        isDisabled={loading}
      />
    </>
  )
}

export default UserSelector
