import * as React from "react";
import { spring } from "react-flip-toolkit";

export function useAnimateListEntry(className: string) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const squares = [
      ...containerRef.current!.querySelectorAll(className),
    ] as HTMLElement[];
    squares.forEach((el, i) => {
      spring({
        config: "wobbly",
        values: {
          translateY: [-10, 0],
          opacity: [0, 1],
        },
        onUpdate: (value) => {
          const { translateY, opacity } = value as {
            translateY: number;
            opacity: number;
          };
          el.style.opacity = String(opacity);
          el.style.transform = `translateY(${translateY}px)`;
        },
        delay: i * 25,
      });
    });
  }, [className]);

  return containerRef;
}
