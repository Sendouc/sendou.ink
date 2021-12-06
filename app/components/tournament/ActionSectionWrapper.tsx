export function ActionSectionWrapper({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: "warning" | "info" | "success" | "error";
}) {
  // todo: flex-dir: column on mobile
  return (
    <section
      className="tournament__action-section"
      style={{ "--action-section-icon-color": `var(--theme-${icon})` } as any}
    >
      <div className="tournament__action-section__content">{children}</div>
    </section>
  );
}
