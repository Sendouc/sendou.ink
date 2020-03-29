import React, { useContext } from "react"
import { ReactComponent as KillsSvg } from "../../assets/splatnet/kills.svg"
import { ReactComponent as DeathSvg } from "../../assets/splatnet/deaths.svg"
import { ReactComponent as BallerSvg } from "../../assets/splatnet/baller.svg"
import { ReactComponent as ColorDefs } from "../../assets/splatnet/colorDefs.svg"
import "./SplatoonIcon.css"
import MyThemeContext from "../../themeContext"

interface SplatnetIconProps {}

const SplatnetIcon: React.FC<SplatnetIconProps> = ({}) => {
  const { themeColorHex } = useContext(MyThemeContext)
  const style = {
    width: "100px",
    height: "auto",
    "--main-bg-color": themeColorHex,
  } as React.CSSProperties
  return (
    <>
      <BallerSvg style={style} />
      <ColorDefs />
    </>
  )
}

export default SplatnetIcon
