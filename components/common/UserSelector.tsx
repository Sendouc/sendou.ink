import { Box, Center, Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { GetAllUsersLeanData } from "prisma/queries/getAllUsersLean";
import { components } from "react-select";
import useSWR from "swr";
import MySelect from "./MySelect";
import UserAvatar from "./UserAvatar";

interface SingleSelectorProps {
  value?: number;
  setValue: (value: number) => void;
  isMulti: false | undefined;
  maxMultiCount: undefined;
}

interface MultiSelectorProps {
  value: number[];
  setValue: (value: number[]) => void;
  isMulti: true;
  maxMultiCount: number;
}

const UserSelector: React.FC<SingleSelectorProps | MultiSelectorProps> = ({
  value,
  setValue,
  isMulti,
  maxMultiCount,
}) => {
  const { data } = useSWR<GetAllUsersLeanData>("/api/users");

  const singleOption = (props: any) => {
    return (
      <components.Option {...props}>
        <Flex alignItems="center">
          <Box mr="0.5em">
            <UserAvatar user={props.data.data} />
          </Box>
          {props.label}
        </Flex>
      </components.Option>
    );
  };

  return (
    <MySelect
      options={getUsersArray().map((user) => ({
        label: `${user.username}#${user.discriminator}`,
        value: "" + user.id,
        data: user,
      }))}
      setValue={(newValue) => {
        if (isMulti) {
          setValue(newValue.map((value: string) => parseInt(value)));
        } else {
          setValue(newValue ? parseInt(newValue) : newValue);
        }
      }}
      isSearchable
      isMulti={isMulti}
      components={{
        IndicatorSeparator: () => null,
        Option: singleOption,
        NoOptionsMessage: () => (
          <Center p={4}>
            {isTooManyItems() ? (
              <Trans>Only {maxMultiCount} users allowed</Trans>
            ) : (
              <Trans>No results with this filter</Trans>
            )}
          </Center>
        ),
      }}
      hideMenuBeforeTyping
      isClearable={!isMulti}
    />
  );

  function getUsersArray() {
    if (!data) return [];
    if (isTooManyItems()) {
      return [];
    }

    return data;
  }

  function isTooManyItems() {
    return (
      maxMultiCount && Array.isArray(value) && maxMultiCount <= value.length
    );
  }
};

export default UserSelector;
