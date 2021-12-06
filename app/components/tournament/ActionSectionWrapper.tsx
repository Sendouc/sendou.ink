export function ActionSectionWrapper({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: "warning" | "info" | "success" | "error";
}) {
  return (
    <section
      className="tournament__action-section"
      style={{ "--action-section-icon-color": `var(--theme-${icon})` } as any}
    >
      <div className="tournament__action-section__content">{children}</div>
    </section>
  );
}
