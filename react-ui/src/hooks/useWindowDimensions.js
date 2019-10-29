//https://stackoverflow.com/a/36862446

import { useState, useEffect } from "react"

const getContainerWidth = width => {
  if (width < 768) {
    return width - 45
  } else if (width < 992) {
    return 723
  } else if (width < 1200) {
    return 933
  }

  return 1127
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window
  const containerWidth = getContainerWidth(width)
  return {
    width,
    height,
    containerWidth
  }
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowDimensions
}
