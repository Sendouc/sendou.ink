import { Redirect } from "~/components/Redirect";
import type { CastAccount } from "~/db/tables-json";
import { useTournament } from "~/features/tournament/tournament-context";
import { SendouForm } from "~/form/SendouForm";
import { tournamentAdminPage, youtubeUrl } from "~/utils/urls";
import { adminStreamFormSchema } from "../tournament-admin-staff-schemas";

export { action } from "../actions/to.$id.admin.stream.server";

export default function TournamentAdminStreamPage() {
	const tournament = useTournament();

	if (tournament.ctx.isFinalized) {
		return <Redirect to={tournamentAdminPage(tournament.ctx.id)} />;
	}

	return (
		<SendouForm
			schema={adminStreamFormSchema}
			fullWidth
			submitButtonTestId="save-cast-accounts-button"
			defaultValues={{
				castAccounts: (tournament.ctx.castAccounts ?? []).map(castAccountInput),
			}}
		>
			{({ FormField }) => <FormField name="castAccounts" />}
		</SendouForm>
	);
}

function castAccountInput(castAccount: CastAccount) {
	switch (castAccount.platform) {
		case "TWITCH":
			return castAccount.account;
		case "YOUTUBE":
			return youtubeUrl(castAccount.account);
	}
}
