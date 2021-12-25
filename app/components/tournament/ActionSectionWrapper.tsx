import { MyCSSProperties } from "~/utils";

export function ActionSectionWrapper({
  children,
  icon,
  ...rest
}: {
  children: React.ReactNode;
  icon: "warning" | "info" | "success" | "error";
  "data-cy"?: string;
}) {
  // todo: flex-dir: column on mobile
  const style: MyCSSProperties = {
    "--action-section-icon-color": `var(--theme-${icon})`,
  };
  return (
    <section
      className="tournament__action-section"
      style={style}
      data-cy={rest["data-cy"]}
    >
      <div className="tournament__action-section__content">{children}</div>
    </section>
  );
}
