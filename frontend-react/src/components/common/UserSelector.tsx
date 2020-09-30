import { useQuery } from "@apollo/client";
import React from "react";
import { USERS, UsersData } from "../../graphql/queries/users";
import Select from "../elements/Select";
import Error from "./Error";

interface UserSelectorProps {
  id?: string;
  setValue?: (value: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ setValue }) => {
  const { data, error, loading } = useQuery<UsersData>(USERS);

  if (error) return <Error errorMessage={error.message} />;
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
  );
};

export default UserSelector;
