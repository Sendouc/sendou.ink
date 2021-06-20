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

const customFilterOption = (option: any, rawInput: string) => {
  return (
    option.label.toLowerCase().includes(rawInput.toLowerCase()) ||
    option.data.data.profile?.twitterName
      ?.toLowerCase()
      .includes(rawInput.toLowerCase())
  );
};

const UserSelector: React.FC<SingleSelectorProps | MultiSelectorProps> = ({
  value,
  setValue,
  isMulti,
  maxMultiCount,
}) => {
  const { data } = useSWR<GetAllUsersLeanData>("/api/users");

  const singleOption = function UserSelectorSingleOption(props: any) {
    return (
      <components.Option {...props}>
        <Flex alignItems="center">
          <Box mr="0.5em">
            <UserAvatar user={props.data.data} />
          </Box>
          {createLabel(props.data.data)}
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
        NoOptionsMessage: function UserSelectorNoOptionsMessage() {
          return (
            <Center p={4}>
              {isTooManyItems() ? (
                <Trans>Only {maxMultiCount} users allowed</Trans>
              ) : (
                <Trans>No results with this filter</Trans>
              )}
            </Center>
          );
        },
      }}
      hideMenuBeforeTyping
      isClearable={!isMulti}
      customFilterOption={customFilterOption}
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

  function createLabel(user: any) {
    let label = `${user.username}#${user.discriminator}`;
    if (user.profile && user.profile.twitterName)
      label += ` (${user.profile.twitterName})`;
    return label;
  }
};

export default UserSelector;
