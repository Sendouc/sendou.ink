import { styled } from "stitches.config";

export function Avatar({ src }: { src: string }) {
  return (
    <S_Container>
      <S_Avatar src={src} />
    </S_Container>
  );
}

const S_Container = styled("div", {
  position: "relative",
  userSelect: "none",
  overflow: "hidden",
  width: "var(--item-size)",
  minWidth: "var(--item-size)",
  height: "var(--item-size)",
  borderRadius: "$rounded",
});

const S_Avatar = styled("img", {
  objectFit: "cover",
  width: "100%",
  height: "100%",
  display: "block",
});
