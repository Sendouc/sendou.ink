import { useTranslation } from "~/hooks/useTranslation";
import { Label } from "./Label";
import * as React from "react";
import { Button } from "./Button";

const EDITABLE_COLORS = [
  "bg",
  "bg-darker",
  "bg-lighter",
  "text",
  "text-lighter",
  "theme",
] as const;

type CustomColorsRecord = Partial<
  Record<(typeof EDITABLE_COLORS)[number], string>
>;

export function CustomizedColorsInput({
  initialColors,
}: {
  initialColors?: Record<string, string> | null;
}) {
  const { t } = useTranslation();
  const [colors, setColors] = React.useState<CustomColorsRecord>(
    initialColors ?? {}
  );

  return (
    <div className="w-full">
      <Label>{t("custom.colors.title")}</Label>
      <input type="hidden" name="css" value={JSON.stringify(colors)} />
      <div className="colors__grid">
        {EDITABLE_COLORS.map((color) => {
          return (
            <React.Fragment key={color}>
              <div>{t(`custom.colors.${color}`)}</div>
              <input
                type="color"
                className="plain"
                value={colors[color]}
                onChange={(e) => {
                  const extras: Record<string, string> = {};
                  if (color === "bg-lighter") {
                    extras["bg-lightest"] = `${e.target.value}80`;
                  }
                  setColors({ ...colors, ...extras, [color]: e.target.value });
                }}
              />
              <Button
                size="tiny"
                variant="minimal-destructive"
                onClick={() => {
                  const newColors: Record<string, string> = { ...colors };
                  if (color === "bg-lighter") {
                    delete newColors["bg-lightest"];
                  }
                  setColors({ ...newColors, [color]: undefined });
                }}
              >
                {t("actions.reset")}
              </Button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
