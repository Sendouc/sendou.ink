export function SunAndMoonIcon({
  className,
  alt,
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      role="img"
      aria-hidden={alt === ""}
      aria-label={alt !== "" ? alt : undefined}
    >
      {alt !== "" && <title>{alt}</title>}
      <path
        d="m19.921 16.252-1.4411-1.4841m-8.6467-8.9048-1.4411-1.4841m5.8557-0.26889 0.03042-2.0685m4.3307 3.9505 1.4841-1.4411m0.2689 5.8557 2.0685 0.03042m-10.747 2.2802c-3.2025-3.2981 1.7446-8.1018 4.9471-4.8037 3.2012 3.298-1.7459 8.1018-4.9471 4.8037zm3.233 5.4901a7.0662 7.0662 0 0 1-2.7676 0.28142c-3.8978-0.37316-6.7547-3.8351-6.3816-7.7328 0.092161-0.96268 0.3725-1.8613 0.80141-2.6639a7.0917 7.0917 0 0 0-4.9653 6.1002c-0.37316 3.8978 2.4838 7.3597 6.3816 7.7328a7.0917 7.0917 0 0 0 6.9314-3.7177z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
