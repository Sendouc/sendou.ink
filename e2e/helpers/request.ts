import type { Page } from "@playwright/test";

const MAX_ATTEMPTS = 3;

/**
 * Direct POST retrying transient failures. Only for idempotent endpoints. Besides "socket hang
 * up" under load, the request context reuses keep-alive sockets, and one the server closes for
 * idling just as a request goes out fails with ECONNRESET.
 */
export async function postRetryingTransientFailures(
	page: Page,
	url: string,
	options?: Parameters<Page["request"]["post"]>[1],
) {
	for (let attempt = 1; ; attempt++) {
		try {
			return await page.request.post(url, { timeout: 7_500, ...options });
		} catch (error) {
			if (attempt === MAX_ATTEMPTS) throw error;
		}
	}
}
