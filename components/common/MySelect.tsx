import { Select } from "@chakra-ui/react";

interface Props {
  value: string;
  setValue: (value?: string) => void;
  placeholder?: string;
  name?: string;
  children: React.ReactNode;
}

const MySelect: React.FC<Props> = ({
  value,
  setValue,
  placeholder,
  children,
  name,
}) => (
  <Select
    value={value ?? ""}
    onChange={(e) =>
      setValue(e.target.value === "" ? undefined : e.target.value)
    }
    name={name}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </Select>
);

export default MySelect;
