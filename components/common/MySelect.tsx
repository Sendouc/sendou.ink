import { Select } from "@chakra-ui/react";

interface Props {
  value: string;
  setValue: (value?: string) => void;
  options: {
    label: string;
    value: string;
  }[];
  placeholder?: string;
}

const MySelect: React.FC<Props> = ({
  value,
  setValue,
  options,
  placeholder,
}) => {
  return (
    <Select
      value={value}
      onChange={(e) =>
        setValue(e.target.value !== "" ? undefined : e.target.value)
      }
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export default MySelect;
