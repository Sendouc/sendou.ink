export function Image({
  path,
  alt,
  className,
  width,
  height,
}: {
  path: string;
  alt: string;
  className: string;
  width?: number;
  height?: number;
}) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${path}.avif`}
        className={className}
        width={width}
        height={height}
      />
      <img
        alt={alt}
        src={`${path}.png`}
        className={className}
        width={width}
        height={height}
      />
    </picture>
  );
}
