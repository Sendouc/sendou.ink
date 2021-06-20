import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
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
  dataCy?: string;
}

const MarkdownTextarea: React.FC<Props> = ({
  error,
  fieldName,
  title,
  value,
  maxLength,
  register,
  placeholder,
  dataCy,
}) => {
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
        rows={6}
        data-cy={dataCy}
      />
      <FormHelperText display="flex" alignItems="center">
        <LimitProgress
          currentLength={value.length}
          maxLength={maxLength}
          mr={3}
        />
        <Box>
          <Trans>
            Markdown is supported -{" "}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/markdown" target="_blank" rel="noreferrer noopener">
              https://sendou.ink/markdown
            </a>
          </Trans>
        </Box>
      </FormHelperText>
      <FormErrorMessage>{error?.message}</FormErrorMessage>
    </FormControl>
  );
};

export default MarkdownTextarea;
