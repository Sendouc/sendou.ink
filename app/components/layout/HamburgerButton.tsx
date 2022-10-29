import clsx from "clsx";

export function HamburgerButton({
  onClick,
  expanded,
}: {
  onClick: () => void;
  expanded: boolean;
}) {
  return (
    <button
      className="layout__burger"
      onClick={onClick}
      type="button"
      aria-label={!expanded ? "Open menu" : "Close menu"}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          className={clsx("layout__burger__top-line", {
            expanded,
          })}
          x="6"
          y="9"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
        ></rect>
        <rect
          className={clsx("layout__burger__middle-line", {
            expanded,
          })}
          x="6"
          y="15"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
        ></rect>
        <rect
          className={clsx("layout__burger__bottom-line", {
            expanded,
          })}
          x="6"
          y="21"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
        ></rect>
      </svg>
    </button>
  );
}
