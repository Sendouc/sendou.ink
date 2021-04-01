import { Flex } from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import MySelect from "components/common/MySelect";
import { components } from "react-select";
import { TAGS } from "../utils";

interface TagsSelectorProps {
  value?: string[];
  setValue: (value: string[]) => void;
}

const SingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <Flex alignItems="center">{props.data.label}</Flex>
    </components.SingleValue>
  );
};

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <Flex alignItems="center">{props.data.label}</Flex>
    </components.Option>
  );
};

const TagsSelector: React.FC<TagsSelectorProps> = (props) => {
  const { i18n } = useLingui();

  return (
    <MySelect
      options={TAGS.map((tag) => ({
        label: i18n._(tag.name),
        value: tag.code,
      }))}
      //value={getValue()}
      setValue={props.setValue}
      isClearable
      isMulti
      components={{
        IndicatorSeparator: () => null,
        Option,
        SingleValue,
      }}
    />
  );
};

export default TagsSelector;
