import { styled } from "stitches.config";

export function HamburgerButton({
  isExpanded,
  onClick,
}: {
  onClick: () => void;
  isExpanded: boolean;
}) {
  return (
    <S_TransformingBurger
      aria-label="Toggle menu visibility"
      aria-expanded={isExpanded ? "true" : "false"}
      onClick={onClick}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <S_TopLine
          x="6"
          y="9"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
          type={isExpanded ? "expanded" : undefined}
        />
        <S_MiddleLine
          x="6"
          y="15"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
          type={isExpanded ? "expanded" : undefined}
        />
        <S_BottomLine
          x="6"
          y="21"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
          type={isExpanded ? "expanded" : undefined}
        />
      </svg>
    </S_TransformingBurger>
  );
}

const S_TransformingBurger = styled("button", {
  display: "flex",
  width: "var(--item-size)",
  height: "var(--item-size)",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "$1",
  border: "3px solid",
  borderColor: "$bgLighter",
  backgroundColor: "transparent",
  borderRadius: "$rounded",
  color: "inherit",
  cursor: "pointer",
  gap: "2px",

  "@sm": {
    display: "none",
  },
});

const S_TopLine = styled("rect", {
  transform: "none",
  transformOrigin: "16px 10px",
  transitionDuration: "150ms",
  transitionProperty: "transform",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

  variants: {
    type: {
      expanded: {
        transform: "translateY(7px) rotate(45deg)",
      },
    },
  },
});

const S_MiddleLine = styled("rect", {
  opacity: 1,
  transitionDuration: "150ms",
  transitionProperty: "opacity",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

  variants: {
    type: {
      expanded: {
        opacity: 0,
      },
    },
  },
});

const S_BottomLine = styled("rect", {
  transform: "none",
  transformOrigin: "16px 22px",
  transitionDuration: "150ms",
  transitionProperty: "transform",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

  variants: {
    type: {
      expanded: {
        transform: "translateY(-5px) rotate(-45deg)",
      },
    },
  },
});
