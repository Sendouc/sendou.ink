const isEnabled =
  process.env["NEW_RELIC_APP_NAME"] && process.env["NEW_RELIC_LICENSE_KEY"];

const newrelic = isEnabled ? require("newrelic") : {};

export const browserTimingHeader = () =>
  isEnabled
    ? newrelic.getBrowserTimingHeader({
        hasToRemoveScriptWrapper: true,
      })
    : null;

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
    "tags.commit": process.env["RENDER_GIT_COMMIT"],
  });

export const setTransactionName = (name: string) =>
  isEnabled && newrelic.setTransactionName(name);
