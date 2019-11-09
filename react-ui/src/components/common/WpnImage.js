import React from "react"

import english_internal from "../../utils/english_internal.json"
import { wpnMedium } from "../../assets/imageImports"
import { Image } from "semantic-ui-react"

const WpnImage = ({ weapon }) => {
  return <Image src={wpnMedium[english_internal[weapon]]} />
}

export default WpnImage
