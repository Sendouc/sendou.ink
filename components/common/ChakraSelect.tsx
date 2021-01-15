import { Select, SelectProps } from "@chakra-ui/react";

interface Props {
  value: string;
  setValue: (value?: string) => void;
  placeholder?: string;
  name?: string;
  children: React.ReactNode;
}

const ChakraSelect: React.FC<Props & SelectProps> = ({
  value,
  setValue,
  placeholder,
  children,
  name,
  ...props
}) => (
  <Select
    value={value ?? ""}
    onChange={(e) =>
      setValue(e.target.value === "" ? undefined : e.target.value)
    }
    name={name}
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </Select>
);

export default ChakraSelect;
