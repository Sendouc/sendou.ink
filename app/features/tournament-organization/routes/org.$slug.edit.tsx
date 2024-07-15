import { Main } from "~/components/Main";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(1, { message: "Required" }),
	age: z.number().min(10),
});

type FormValues = z.infer<typeof schema>;

export default function TournamentOrganizationEditPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	return (
		<Main>
			<form onSubmit={handleSubmit((d) => console.log(d))}>
				<input {...register("name")} />
				{errors.name?.message && <p>{errors.name.message}</p>}
				<input type="number" {...register("age", { valueAsNumber: true })} />
				{errors.age?.message && <p>{errors.age.message}</p>}
				<input type="submit" />
			</form>
		</Main>
	);
}
