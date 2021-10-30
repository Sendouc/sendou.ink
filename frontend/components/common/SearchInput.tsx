import { HiSearch } from "react-icons/hi";
import { styled } from "stitches.config";

export function SearchInput() {
  return (
    <S_Container>
      <S_Input type="text" placeholder="Search" />
      <HiSearch />
    </S_Container>
  );
}

const S_Container = styled("div", {
  display: "flex",
  height: "1rem",
  alignItems: "center",
  justifyContent: "center",
  paddingX: "$4",
  paddingY: "$5",
  backgroundColor: "$bgLighter",
  borderRadius: "$rounded",

  "&:focus-within": {
    outline: "2px solid $theme",
  },

  "&> svg": {
    height: "1.25rem",
    color: "$text",
  },
});

const S_Input = styled("input", {
  width: "12rem",
  height: "2rem",
  border: "none",
  backgroundColor: "$bgLighter",
  fontSize: "$sm",
  outline: "none",
  color: "$text",
  flexGrow: 1,

  "&::placeholder": {
    color: "$textLighter",
    letterSpacing: "0.5px",
    fontWeight: "$semiBold",
  },
});

// .bigSearchInput {
//   width: 12rem;
//   border: none;
//   background-color: var(--input-bg);
//   font-size: var(--font-xs);
//   outline: none;
// }

// .bigSearchInput::placeholder {
//   color: var(--input-placeholder-color);
//   letter-spacing: 0.5px;
// }
