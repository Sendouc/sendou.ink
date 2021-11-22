import s from "../styles/HamburgerButton.module.css";

export function HamburgerButton(p: {
  onClick: () => void;
  isExpanded: boolean;
}) {
  const expandedString = () => (p.isExpanded ? "true" : "false");

  return (
    <button
      class={s.transformingBurger}
      aria-label="Toggle menu visibility"
      aria-expanded={expandedString()}
      onClick={p.onClick}
      data-cy="hamburger-button"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          class={s.topLine}
          x="6"
          y="9"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
          data-expanded={expandedString()}
        ></rect>
        <rect
          class={s.middleLine}
          x="6"
          y="15"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
          data-expanded={expandedString()}
        ></rect>
        <rect
          class={s.bottomLine}
          x="6"
          y="21"
          width="20"
          height="2"
          rx="1"
          fill="currentColor"
          data-expanded={expandedString()}
        ></rect>
      </svg>
    </button>
  );
}
