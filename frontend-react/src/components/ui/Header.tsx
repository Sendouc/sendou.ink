import React from "react"
import { Heading } from "@chakra-ui/core"

interface HeaderProps {
  children: string | string[]
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  return <Heading>{children}</Heading>
}
