import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea,
} from "@chakra-ui/core";
import { useTranslation } from "lib/useMockT";
import { FieldError } from "react-hook-form";
import LimitProgress from "./LimitProgress";

interface Props {
  error?: FieldError;
  fieldName: string;
  title: string;
  value: string;
  maxLength: number;
  register: any;
  placeholder?: string;
}

const MarkdownTextarea: React.FC<Props> = ({
  error,
  fieldName,
  title,
  value,
  maxLength,
  register,
  placeholder,
}) => {
  const { t } = useTranslation();
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={fieldName} mt={4}>
        {title}
      </FormLabel>
      <Textarea
        ref={register}
        name={fieldName}
        placeholder={placeholder}
        resize="vertical"
      />
      <FormHelperText display="flex" alignItems="center">
        <LimitProgress
          currentLength={value.length}
          maxLength={maxLength}
          mr={3}
        />
        <Box>
          {t("users;markdownPrompt")}{" "}
          <a href="/markdown" target="_blank" rel="noreferrer noopener">
            https://sendou.ink/markdown
          </a>
        </Box>
      </FormHelperText>
      <FormErrorMessage>{error?.message}</FormErrorMessage>
    </FormControl>
  );
};

export default MarkdownTextarea;
