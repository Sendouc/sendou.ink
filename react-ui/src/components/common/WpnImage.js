import React from "react"

import english_internal from "../../utils/english_internal.json"
import { wpnSmall, wpnMedium } from "../../assets/imageImports"
import { Image } from "semantic-ui-react"

const WpnImage = ({ weapon, size = "MEDIUM", style = {} }) => {
  const dictToUse = size === "MEDIUM" ? wpnMedium : wpnSmall
  return <Image style={style} src={dictToUse[english_internal[weapon]]} />
}

export default WpnImage
