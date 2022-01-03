import classNames from "classnames";
import { MyCSSProperties } from "~/utils";

export function ActionSectionWrapper({
  children,
  icon,
  ...rest
}: {
  children: React.ReactNode;
  icon?: "warning" | "info" | "success" | "error";
  "justify-center"?: boolean;
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
      className="tournament__action-section"
      style={style}
      data-cy={rest["data-cy"]}
    >
      <div
        className={classNames("tournament__action-section__content", {
          "justify-center": rest["justify-center"],
        })}
      >
        {children}
      </div>
    </section>
  );
}
