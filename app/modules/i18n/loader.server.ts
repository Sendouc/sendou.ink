import { resolve } from "node:path";
import type { EntryContext } from "@remix-run/server-runtime";
import { createInstance } from "i18next";
import type { i18n as i18nType } from "i18next";
import Backend from "i18next-fs-backend";
import { initReactI18next } from "react-i18next";
import { config } from "./config";
import i18next from "./i18next.server";

export async function i18Instance(request: Request, context: EntryContext) {
	const instance = createInstance() as i18nType;

	const lng = await i18next.getLocale(request);
	const ns = i18next.getRouteNamespaces(context);

	await instance
		.use(initReactI18next)
		.use(Backend)
		.init({
			...config,
			lng,
			ns,
			backend: {
				loadPath: resolve("./locales/{{lng}}/{{ns}}.json"),
			},
		});

	return instance;
}
