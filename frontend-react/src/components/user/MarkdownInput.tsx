import React, { useState } from "react"
import TextArea from "../elements/TextArea"
import Button from "../elements/Button"
import { Box } from "@chakra-ui/core"
import Markdown from "../elements/Markdown"
import SubHeader from "../common/SubHeader"

interface MarkdownInputProps {
  value: string
  setValue: (value: string) => void
  label: string
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({
  value,
  setValue,
  label,
}) => {
  const [preview, setPreview] = useState(false)
  return (
    <>
      {preview ? (
        <>
          <SubHeader>{label} Preview</SubHeader>
          <Markdown value={value} />
        </>
      ) : (
        <TextArea
          value={value}
          setValue={setValue}
          label={label}
          height="150px"
        />
      )}
      <Box mt="0.5em">
        <Button outlined onClick={() => setPreview(!preview)}>
          {preview ? "Edit" : "Preview"}
        </Button>
      </Box>
    </>
  )
}

export default MarkdownInput
