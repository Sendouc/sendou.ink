interface WeaponImageProps
  extends React.ButtonHTMLAttributes<HTMLImageElement> {
  weapon: string;
}

export function WeaponImage(props: WeaponImageProps) {
  return (
    <img
      src={`/img/weapons/${encodeURIComponent(
        props.weapon.replaceAll(".", "")
      )}.webp`}
      alt={props.weapon}
      title={props.weapon}
      loading="lazy"
      {...props}
    />
  );
}
