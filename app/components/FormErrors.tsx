import { useActionData } from "@remix-run/react";

export function FormErrors() {
  const actionData = useActionData<{ errors?: string[] }>();

  if (!actionData?.errors || actionData.errors.length === 0) {
    return null;
  }

  return (
    <div className="form-errors">
      <h4>Following errors need to be fixed:</h4>
      <ol>
        {actionData.errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ol>
    </div>
  );
}
