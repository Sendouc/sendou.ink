import { ServerConfig } from "~/config.server";
import { invariant } from "~/utils/invariant";

export const hasYoutubeEnvVars = () => Boolean(ServerConfig.youtube.apiKey);

export const getYoutubeApiKey = () => {
	const { apiKey } = ServerConfig.youtube;
	invariant(apiKey, "Missing YOUTUBE_API_KEY env var");

	return apiKey;
};
