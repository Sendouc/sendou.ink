import { useActionData } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";

export function FormErrors({ namespace }: { namespace: "user" | "calendar" }) {
  const { t } = useTranslation(["common", namespace]);
  const actionData = useActionData<{ errors?: string[] }>();

  if (!actionData?.errors || actionData.errors.length === 0) {
    return null;
  }

  return (
    <div className="form-errors">
      <h4>{t("common:forms.errors.title")}:</h4>
      <ol>
        {actionData.errors.map((error) => (
          <li key={error}>{t(`${namespace}:${error}` as any)}</li>
        ))}
      </ol>
    </div>
  );
}
