export function Image({
  path,
  alt,
  title,
  className,
  width,
  height,
}: {
  path: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <picture title={title}>
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
