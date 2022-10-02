export function Image({
  path,
  alt,
  title,
  className,
  width,
  height,
  style,
}: {
  path: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <picture title={title}>
      <source
        type="image/avif"
        srcSet={`${path}.avif`}
        className={className}
        width={width}
        height={height}
        style={style}
      />
      <img
        alt={alt}
        src={`${path}.png`}
        className={className}
        width={width}
        height={height}
        style={style}
        draggable="false"
      />
    </picture>
  );
}
