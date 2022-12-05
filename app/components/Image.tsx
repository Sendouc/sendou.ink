export function Image({
  path,
  alt,
  title,
  className,
  width,
  height,
  style,
  containerClassName,
}: {
  path: string;
  alt: string;
  title?: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <picture title={title} className={containerClassName}>
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
        width={width}
        height={height}
        style={style}
        draggable="false"
      />
    </picture>
  );
}
