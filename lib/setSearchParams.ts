export const setSearchParams = (key: string, value: string | undefined) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value); // encodeURIComponent(value)
  }

  history.replaceState(
    {},
    "",
    `${window.location.pathname}${
      Array.from(params.entries()).length ? "?" : ""
    }${params.toString()}`
  );
};
