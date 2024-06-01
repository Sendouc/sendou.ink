const isEnabled =
  process.env["NEW_RELIC_APP_NAME"] && process.env["NEW_RELIC_LICENSE_KEY"];

import newrelic from "newrelic";

export const noticeError = (
  error: Error,
  attributes?: {
    "enduser.id"?: number;
    formData?: string;
    searchParams?: string;
    params?: string;
  },
) =>
  isEnabled &&
  newrelic.noticeError(error, {
    ...attributes,
    "tags.commit": process.env["RENDER_GIT_COMMIT"]!,
  });

export const setTransactionName = (name: string) =>
  isEnabled && newrelic.setTransactionName(name);

export const ignoreTransaction = () => {
  if (!isEnabled) return;

  const transactionHandle = newrelic.getTransaction();
  transactionHandle.ignore();
};
