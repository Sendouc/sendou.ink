import type { Mode, Stage } from ".prisma/client";
import classNames from "classnames";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
  useMatches,
} from "remix";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { RefreshIcon } from "~/components/icons/Refresh";
import { modesShort, modesShortToLong } from "~/constants";
import { eliminationBracket } from "~/core/tournament/algorithms";
import {
  EliminationBracketSide,
  MapListIds,
  MapListIdsSchema,
  participantCountToRoundsInfo,
} from "~/core/tournament/bracket";
import { useTournamentRounds } from "~/hooks/useTournamentRounds";
import type {
  UseTournamentRoundsAction,
  UseTournamentRoundsArgs,
  UseTournamentRoundsState,
} from "~/hooks/useTournamentRounds/types";
import {
  createTournamentRounds,
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import startBracketTabStylesUrl from "~/styles/tournament-start.css";
import { requireUser } from "~/utils";

// TODO: error if not admin AND keep the links available

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: startBracketTabStylesUrl }];
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const formData = await request.formData();
  const mapListString = formData.get("map-list");
  const bracketId = formData.get("bracket-id");
  invariant(typeof mapListString === "string", "Type of map list not string");
  invariant(typeof bracketId === "string", "Type of bracket id not string");
  const mapList = MapListIdsSchema.parse(JSON.parse(mapListString));

  const organizationNameForUrl = params.organization;
  const tournamentNameForUrl = params.tournament;
  invariant(organizationNameForUrl, "organizationNameForUrl is undefined");
  invariant(tournamentNameForUrl, "tournamentNameForUrl is undefined");

  const user = requireUser(context);

  await createTournamentRounds({
    mapList,
    organizationNameForUrl,
    tournamentNameForUrl,
    userId: user.id,
    bracketId,
  });

  return redirect(
    `/to/${organizationNameForUrl}/${tournamentNameForUrl}/bracket`
  );
};

const typedJson = (args: UseTournamentRoundsArgs) => json(args);

export const loader: LoaderFunction = async ({ params }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  const tournament = await findTournamentByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });

  const teamCount = tournament.teams.reduce(
    (acc, cur) => acc + (cur.checkedInTime ? 1 : 0),
    0
  );

  // TODO: handle many brackets
  const bracket = eliminationBracket(teamCount, tournament.brackets[0].type);
  const initialState = participantCountToRoundsInfo({
    bracket,
    mapPool: tournament.mapPool,
  });

  return typedJson({ initialState, mapPool: tournament.mapPool });
};

// TODO: component that shows a table of map, counts in the map pool, which rounds
// TODO: handle warning if check-in has not concluded
export default function StartBracketTab() {
  const [, parentRoute] = useMatches();
  const { brackets } = parentRoute.data as FindTournamentByNameForUrlI;
  const args = useLoaderData<UseTournamentRoundsArgs>();
  const [{ bracket, showAlert, actionButtonsDisabled }, dispatch] =
    useTournamentRounds(args);

  // TODO: dropdown to select this
  const bracketId = brackets[0].id;

  const mapListForInput: MapListIds = {
    losers: bracket.winners.map((round) => round.mapList),
    winners: bracket.winners.map((round) => round.mapList),
  };

  return (
    <Form method="post" className="width-100">
      <input
        type="hidden"
        name="map-list"
        value={JSON.stringify(mapListForInput)}
      />
      <input type="hidden" name="bracket-id" value={bracketId} />
      <div className="tournament__start__container">
        <ActionButtons
          dispatch={dispatch}
          disabled={actionButtonsDisabled}
          showAlert={showAlert}
          position="top"
        />
        <div className="tournament__start__round-collections-container">
          <RoundsCollection
            side="winners"
            dispatch={dispatch}
            rounds={bracket.winners}
          />
          {args.initialState.losers.length > 0 && (
            <RoundsCollection
              side="losers"
              dispatch={dispatch}
              rounds={bracket.losers}
            />
          )}
        </div>
        <ActionButtons
          dispatch={dispatch}
          disabled={actionButtonsDisabled}
          showAlert={showAlert}
          position="bottom"
        />
      </div>
    </Form>
  );
}

function ActionButtons({
  dispatch,
  disabled,
  showAlert,
  position,
}: {
  dispatch: React.Dispatch<UseTournamentRoundsAction>;
  disabled?: boolean;
  showAlert: boolean;
  position: "top" | "bottom";
}) {
  return (
    <>
      {position === "bottom" && showAlert && (
        <Alert type="warning">Save or cancel the round being edited</Alert>
      )}
      <div className="tournament__start__action-buttons__container">
        <Button
          type={disabled ? "button" : "submit"}
          onClick={
            disabled ? () => dispatch({ type: "SHOW_ALERT" }) : undefined
          }
        >
          Start bracket
        </Button>
        <Button
          variant="outlined"
          type="button"
          onClick={() =>
            disabled
              ? dispatch({ type: "SHOW_ALERT" })
              : dispatch({ type: "REGENERATE_MAP_LIST" })
          }
          icon={<RefreshIcon />}
        >
          Regenerate all maps
        </Button>
      </div>
      {position === "top" && showAlert && (
        <Alert type="warning">Save or cancel the round being edited</Alert>
      )}
    </>
  );
}

function RoundsCollection({
  side,
  dispatch,
  rounds,
}: {
  side: EliminationBracketSide;
  dispatch: React.Dispatch<UseTournamentRoundsAction>;
  rounds: UseTournamentRoundsState["bracket"]["winners"];
}) {
  const { mapPool } = useLoaderData<UseTournamentRoundsArgs>();

  return (
    <div>
      <h2 className="tournament__start__title">{side}</h2>
      <div className="tournament__start__rounds-container">
        {rounds.map((round, roundIndex) => {
          return (
            // TODO: key potentially unstable
            <section key={round.name} className="tournament__start__round">
              <h4>{round.name}</h4>
              <div className="tournament__start__best-of-buttons-container">
                {([3, 5, 7, 9] as const).map((bestOf) => (
                  <button
                    key={bestOf}
                    type="button"
                    className={classNames("tournament__start__best-of", {
                      active: round.bestOf === bestOf,
                    })}
                    onClick={() =>
                      dispatch({
                        type: "SET_ROUND_BEST_OF",
                        data: {
                          newBestOf: bestOf,
                          side,
                          index: roundIndex,
                        },
                      })
                    }
                  >
                    Bo{bestOf}
                  </button>
                ))}
              </div>
              <ol className="tournament__start__rounds-list">
                {round.mapList.map((stage, stageI) => {
                  if (round.editing) {
                    return (
                      <li className="tournament__start__map-row" key={stage.id}>
                        <select
                          value={round.newMapList?.[stageI].id ?? stage.id}
                          onChange={(e) => {
                            const newStage = mapPool.find(
                              (stage) => stage.id === Number(e.target.value)
                            );
                            invariant(newStage, "newStage not found");
                            dispatch({
                              type: "EDIT_STAGE",
                              data: {
                                index: roundIndex,
                                newStage,
                                side,
                                stageNumber: stageI + 1,
                              },
                            });
                          }}
                        >
                          {modesShort.flatMap((mode) => {
                            const stages = stagesForSelect()[mode];
                            if (!stages) return [];

                            return (
                              <optgroup
                                key={mode}
                                label={modesShortToLong[mode]}
                              >
                                {stages.map((stage) => (
                                  <option key={stage.id} value={stage.id}>
                                    {stage.mode} {stage.name}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>
                      </li>
                    );
                  }
                  return (
                    <li
                      className="tournament__start__map-row"
                      key={"" + stageI + stage.id}
                    >
                      <img
                        src={`/img/modes/${stage.mode}.webp`}
                        className="tournament__start__mode-image"
                        width="30"
                        height="30"
                      />{" "}
                      <span>{stage.name}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="tournament__start__round-card-buttons__container">
                {round.editing ? (
                  <>
                    <Button
                      variant="minimal"
                      tiny
                      onClick={() =>
                        dispatch({
                          type: "SAVE_ROUND",
                          data: { side, index: roundIndex },
                        })
                      }
                    >
                      Save
                    </Button>
                    <Button
                      variant="minimal-destructive"
                      tiny
                      onClick={() =>
                        dispatch({
                          type: "CANCEL_EDITING_ROUND",
                          data: { side, index: roundIndex },
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  // TODO: should be at the bottom always
                  <Button
                    variant="minimal"
                    tiny
                    onClick={() =>
                      dispatch({
                        type: "START_EDITING_ROUND",
                        data: { side, index: roundIndex },
                      })
                    }
                  >
                    Edit maps
                  </Button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );

  function stagesForSelect() {
    return [...mapPool]
      .sort((a, b) => a.id - b.id)
      .reduce((acc: Partial<Record<Mode, Stage[]>>, cur) => {
        const stages = acc[cur.mode] ?? [];
        stages.push(cur);
        acc[cur.mode] = stages;
        return acc;
      }, {});
  }
}

export const CatchBoundary = Catcher;
