import React, { useContext } from "react"
import MyThemeContext from "../../themeContext"

export const FooterWaves = () => {
  const { themeColorHex, themeColorHexLighter, colorMode } = useContext(
    MyThemeContext
  )
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 225">
      <path
        fill={colorMode === "dark" ? themeColorHexLighter : themeColorHex}
        fill-opacity="1"
        d="M0,128L60,138.7C120,149,240,171,360,160C480,149,600,107,720,85.3C840,64,960,64,1080,90.7C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
      ></path>
    </svg>
  )
}
