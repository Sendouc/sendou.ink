import { Flag } from "~/components/Flag";
import { Image } from "~/components/Image";
import { Placement } from "~/components/Placement";
import { winnersImageUrl } from "~/utils/urls";

export function TopTenPlayer({
  power,
  placement,
  season,
  name,
  countryCode,
}: {
  power: number;
  placement: number;
  season: number;
  name: string;
  countryCode: string;
}) {
  return (
    <div className="stack horizontal sm">
      <div className="winner__container">
        <Image
          path={winnersImageUrl({ season, placement })}
          alt=""
          containerClassName="winner__img-container"
          className="winner__img"
          height={125}
        />
      </div>
      <div>
        <div className="text-xs text-lighter stack horizontal xs items-center">
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
