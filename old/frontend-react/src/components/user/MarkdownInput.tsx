import { Box, Button } from "@chakra-ui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SubHeader from "../common/SubHeader";
import Markdown from "../elements/Markdown";
import TextArea from "../elements/TextArea";

interface MarkdownInputProps {
  value: string;
  setValue: (value: string) => void;
  label: string;
  limit?: number;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({
  value,
  setValue,
  label,
  limit,
}) => {
  const [preview, setPreview] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      {preview ? (
        <>
          <SubHeader>
            {label} {t("users;Preview")}
          </SubHeader>
          <Markdown value={value} />
        </>
      ) : (
        <TextArea
          value={value}
          setValue={setValue}
          label={label}
          height="150px"
          limit={limit}
        />
      )}
      <Box mt="0.5em">
        <Button variant="outline" onClick={() => setPreview(!preview)}>
          {preview ? t("users;Edit") : t("users;Preview")}
        </Button>
      </Box>
    </>
  );
};

export default MarkdownInput;
