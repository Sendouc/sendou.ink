import { MyCSSProperties } from "~/utils";

export function ActionSectionWrapper({
  children,
  icon,
  ...rest
}: {
  children: React.ReactNode;
  icon?: "warning" | "info" | "success" | "error";
  "data-cy"?: string;
}) {
  // todo: flex-dir: column on mobile
  const style: MyCSSProperties | undefined = icon
    ? {
        "--action-section-icon-color": `var(--theme-${icon})`,
      }
    : undefined;
  return (
    <section
      className="p-1.5 rounded-2xl css-var-tournaments-bg grow"
      style={style}
      data-cy={rest["data-cy"]}
    >
      <div className="flex w-full h-full p-3 text-sm font-semibold align-center rounded-2xl gap-1-5 bg-bg-lighter">
        {children}
      </div>
    </section>
  );
}
