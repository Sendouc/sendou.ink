import { getEnglishOrdinalSuffix } from "~/utils/strings"

export type PlacementProps = {
    placement: number,
    iconClassName?: string,
    textClassName?: string
}

const getSpecialPlacementIconPath = (placement: number): string | null => {
    switch (placement) {
        case 3: 
            return'/svg/placements/third.svg';
        case 2:
            return '/svg/placements/second.svg';
        case 1:
            return '/svg/placements/first.svg';
        default:
            return null;
    }
}

export function Placement({ placement, iconClassName, textClassName }: PlacementProps) {
    /* 
        Placements are using english ordinal syntax only.
        If wished for, we could look into properly adding translations here, but
        english-style ordinals are commonly used internationally as well.
    */
    const ordinalSuffix = getEnglishOrdinalSuffix(placement);
    const iconPath = getSpecialPlacementIconPath(placement);

    if (!iconPath) {
        return <span className={textClassName} lang="en-us">
            {placement}<sup>{ordinalSuffix}</sup>
        </span>
    } 

    const placementString = `${placement}${ordinalSuffix}`;

    return <img
        lang="en-us"
        alt={placementString}
        title={placementString}
        src={iconPath}
        className={iconClassName}
        height={20}
        width={20}
    />
}