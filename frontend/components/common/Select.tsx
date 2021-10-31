import { styled } from "stitches.config";

export function Select({
  values,
  onChange,
  selected,
}: {
  values: { id: string; name: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selected: string;
}) {
  return (
    <S_Select onChange={onChange}>
      {values.map((value) => {
        return (
          <option
            key={value.id}
            value={value.id}
            selected={value.id === selected}
          >
            {value.name}
          </option>
        );
      })}
    </S_Select>
  );
}

const S_Select = styled("select", {
  all: "unset",
  width: "100%",
  padding: "$2 $4",
  backgroundColor: "$bgLighter",
  backgroundImage: `url('data:image/svg+xml;utf8,<svg width="1rem" color="white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>')`,
  backgroundPositionX: "95%",
  backgroundPositionY: "50%",
  backgroundRepeat: "no-repeat",
  borderRadius: "$rounded",
  cursor: "pointer",
  fontWeight: "$body",
  fontSize: "$sm",

  "&::selection": {
    fontWeight: "$bold",
  },

  "&:focus": {
    outline: "2px solid $theme",
  },
});
