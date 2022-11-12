import { useTranslation } from "~/hooks/useTranslation";

export type PlacementProps = {
  placement: number;
  iconClassName?: string;
  textClassName?: string;
};

const getSpecialPlacementIconPath = (placement: number): string | null => {
  switch (placement) {
    case 3:
      return "/svg/placements/third.svg";
    case 2:
      return "/svg/placements/second.svg";
    case 1:
      return "/svg/placements/first.svg";
    default:
      return null;
  }
};

export function Placement({
  placement,
  iconClassName,
  textClassName,
}: PlacementProps) {
  const { t } = useTranslation(undefined, {});

  // Remove assertion if types stop claiming result is "never".
  const ordinalSuffix: string = t("results.placeSuffix", {
    count: placement,
    ordinal: true,
    // no suffix is a better default than english
    defaultValue: "",
    fallbackLng: [],
  });

  const isSuperscript = ordinalSuffix.startsWith("^");
  const ordinalSuffixText = ordinalSuffix.replace(/^\^/, "");

  const iconPath = getSpecialPlacementIconPath(placement);

  if (!iconPath) {
    return (
      <span className={textClassName}>
        {placement}
        {isSuperscript ? <sup>{ordinalSuffixText}</sup> : ordinalSuffixText}
      </span>
    );
  }

  const placementString = `${placement}${ordinalSuffixText}`;

  return (
    <img
      alt={placementString}
      title={placementString}
      src={iconPath}
      className={iconClassName}
      height={20}
      width={20}
    />
  );
}
