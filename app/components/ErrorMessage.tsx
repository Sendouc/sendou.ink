export default function ErrorMessage({ errorMsg }: { errorMsg?: string }) {
  if (!errorMsg) return null;

  return (
    <p className="form-validation-error" role="alert">
      {errorMsg}
    </p>
  );
}
