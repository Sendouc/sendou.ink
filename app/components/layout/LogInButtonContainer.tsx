import { useSearchParams } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { LOG_IN_URL } from "~/utils/urls";
import { Button } from "../Button";
import { Dialog } from "../Dialog";

export function LogInButtonContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const authError = searchParams.get("authError");
  const closeAuthErrorDialog = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("authError");
    setSearchParams(newSearchParams);
  };

  return (
    <>
      <form action={LOG_IN_URL} method="post">
        {children}
      </form>
      {authError != null && (
        <Dialog isOpen close={closeAuthErrorDialog}>
          <div className="stack md">
            <AuthenticationErrorHelp errorCode={authError} />
            <Button onClick={closeAuthErrorDialog}>{t("actions.close")}</Button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function AuthenticationErrorHelp({ errorCode }: { errorCode: string }) {
  const { t } = useTranslation();

  switch (errorCode) {
    case "aborted":
      return (
        <>
          <h2 className="text-lg text-center">{t("auth.errors.aborted")}</h2>
          {t("auth.errors.discordPermissions")}
        </>
      );
    case "unknown":
    default:
      return (
        <>
          <h2 className="text-lg text-center">{t("auth.errors.failed")}</h2>
          {t("auth.errors.unknown")}
        </>
      );
  }
}
