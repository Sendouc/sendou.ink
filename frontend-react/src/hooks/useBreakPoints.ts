import { useState, useEffect } from "react";

function getWindowWidth() {
  const { innerWidth: width } = window;
  return width;
}

export default function useBreakPoints(breakpoints: number | number[]) {
  const [windowWidth, setWindowWidth] = useState<number>(getWindowWidth());

  useEffect(() => {
    function handleResize() {
      setWindowWidth(getWindowWidth());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (Array.isArray(breakpoints)) {
    return breakpoints.map((breakpoint) => windowWidth < breakpoint);
  }

  return windowWidth < breakpoints;
}
