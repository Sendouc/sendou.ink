import { MyCSSProperties } from "~/utils";

export function ActionSectionWrapper({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: "warning" | "info" | "success" | "error";
}) {
  // todo: flex-dir: column on mobile
  const style: MyCSSProperties = {
    "--action-section-icon-color": `var(--theme-${icon})`,
  };
  return (
    <section className="tournament__action-section" style={style}>
      <div className="tournament__action-section__content">{children}</div>
    </section>
  );
}
