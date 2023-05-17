import { useTranslation } from "~/hooks/useTranslation";
import type { MainWeaponId, ModeShort } from "~/modules/in-game-lists";
import {
  mainWeaponImageUrl,
  modeImageUrl,
  outlinedMainWeaponImageUrl,
} from "~/utils/urls";

interface ImageProps {
  path: string;
  alt: string;
  title?: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  size?: number;
  style?: React.CSSProperties;
  testId?: string;
  onClick?: () => void;
}

export function Image({
  path,
  alt,
  title,
  className,
  width,
  height,
  size,
  style,
  testId,
  containerClassName,
  onClick,
}: ImageProps) {
  return (
    <picture title={title} className={containerClassName} onClick={onClick}>
      <source
        type="image/avif"
        srcSet={`${path}.avif`}
        width={width}
        height={height}
        style={style}
      />
      <img
        alt={alt}
        src={`${path}.png`}
        className={className}
        width={size ?? width}
        height={size ?? height}
        style={style}
        draggable="false"
        data-testid={testId}
      />
    </picture>
  );
}

type WeaponImageProps = {
  weaponSplId: MainWeaponId;
  variant: "badge" | "build";
} & Omit<ImageProps, "path" | "alt" | "title">;

export function WeaponImage({
  weaponSplId,
  variant,
  testId,
  ...rest
}: WeaponImageProps) {
  const { t } = useTranslation(["weapons"]);

  return (
    <Image
      {...rest}
      alt={t(`weapons:MAIN_${weaponSplId}`)}
      title={t(`weapons:MAIN_${weaponSplId}`)}
      testId={testId}
      path={
        variant === "badge"
          ? outlinedMainWeaponImageUrl(weaponSplId)
          : mainWeaponImageUrl(weaponSplId)
      }
    />
  );
}

type ModeImageProps = {
  mode: ModeShort;
} & Omit<ImageProps, "path" | "alt" | "title">;

export function ModeImage({ mode, testId, ...rest }: ModeImageProps) {
  const { t } = useTranslation(["game-misc"]);

  return (
    <Image
      {...rest}
      alt={t(`game-misc:MODE_LONG_${mode}`)}
      title={t(`game-misc:MODE_LONG_${mode}`)}
      testId={testId}
      path={modeImageUrl(mode)}
    />
  );
}
