import { Flag } from "~/components/Flag";
import { Image } from "~/components/Image";
import { Placement } from "~/components/Placement";
import { winnersImageUrl } from "~/utils/urls";
import playerData from "../top-ten.json";
import invariant from "tiny-invariant";

export function TopTenPlayer({
  power,
  placement,
  season,
}: {
  power: number;
  placement: number;
  season: number;
}) {
  const data = playerData[season]?.[placement - 1];
  invariant(data, `No data for season ${season} and placement ${placement}`);
  const { name, countryCode, transforms } = data;

  return (
    <div className="stack horizontal items-center md">
      <div className="winner__container">
        <Image
          path={winnersImageUrl({ season, placement })}
          alt=""
          containerClassName="winner__img-container"
          className="winner__img"
          height={150}
          containerStyle={
            {
              "--winner-top": transforms?.top
                ? `${transforms.top}px`
                : undefined,
              "--winner-left": transforms?.left
                ? `${transforms.left}px`
                : undefined,
            } as React.CSSProperties
          }
        />
      </div>
      <div>
        <div
          className="text-xs text-lighter stack horizontal xs items-center"
          style={placement > 3 ? { marginBlockEnd: "-4px" } : undefined}
        >
          {placement <= 3 ? (
            <Placement placement={placement} size={15} />
          ) : null}{" "}
          <Placement placement={placement} textOnly showAsSuperscript={false} />{" "}
          place
        </div>
        <div className="text-xl font-semi-bold">
          <Flag tiny countryCode={countryCode} /> {name}
        </div>
        <div className="text-lg font-bold" style={{ lineHeight: "1" }}>
          {power}
        </div>
      </div>
    </div>
  );
}
