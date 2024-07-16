import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "@remix-run/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { ActionError } from "~/utils/remix";

export function useMyForm<T extends z.ZodTypeAny>(
	schema: T,
	defaultValues?: z.infer<T>,
) {
	const fetcher = useFetcher<any>();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<z.infer<T>>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	React.useEffect(() => {
		if (!fetcher.data?.error) return;

		const { error } = fetcher.data as ActionError;

		// xxx: implement translated
		if (error.type === "i18n") {
			throw new Error("unimplemented");
		}

		setError(error.field as any, {
			message: error.msg,
		});
	}, [fetcher.data, setError]);

	const onSubmit = React.useCallback(
		handleSubmit((values) =>
			fetcher.submit(values, { method: "post", encType: "application/json" }),
		),
		[],
	);

	return { register, onSubmit, errors };
}
