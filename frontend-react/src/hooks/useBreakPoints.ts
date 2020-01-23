import { useState, useEffect } from "react"

function getWindowWidth() {
  const { innerWidth: width } = window
  return width
}

export default function useBreakPoints(breakpoint: number) {
  const [windowWidth, setWindowWidth] = useState<number>(getWindowWidth())

  useEffect(() => {
    function handleResize() {
      setWindowWidth(getWindowWidth())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowWidth < breakpoint
}
