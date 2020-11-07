export async function sendData(method = "POST", url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.status < 200 || response.status > 299) {
    // FIXME: different messages for different status codes and translated
    throw Error("Invalid request");
  }
}
