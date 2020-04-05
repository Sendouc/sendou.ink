import React from "react"
import TextArea from "../elements/TextArea"

interface MarkdownInputProps {
  value: string
  setValue: (value: string) => void
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ value, setValue }) => {
  return <TextArea value={value} setValue={setValue} />
}

export default MarkdownInput
