import { isIP } from "node:net";
import { ServerConfig } from "~/config.server";

const CONTENT_TYPES: Record<string, string> = {
	avif: "image/avif",
	gif: "image/gif",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
};

let client: Bun.S3Client | undefined;

/** Uploads a publicly readable file to the S3 compatible object storage bucket under `fileName` */
export async function uploadToS3(
	data: Uint8Array<ArrayBuffer>,
	fileName: string,
) {
	client ??= storageClient();
	const extension = fileName.split(".").pop() ?? "";

	await client.write(fileName, data, {
		acl: "public-read",
		type: CONTENT_TYPES[extension] ?? "application/octet-stream",
	});
}

/** Virtual-hosted style (`bucket.host/key`) like the AWS SDK, path style for IP address endpoints */
function storageClient() {
	const { endpoint, accessKey, secret, region, bucket } = ServerConfig.storage;
	const url = new URL(endpoint);
	const virtualHostedStyle = !isIP(url.hostname);
	if (virtualHostedStyle) {
		url.hostname = `${bucket}.${url.hostname}`;
	}

	return new Bun.S3Client({
		endpoint: url.origin,
		virtualHostedStyle,
		accessKeyId: accessKey,
		secretAccessKey: secret,
		region,
		bucket,
	});
}
