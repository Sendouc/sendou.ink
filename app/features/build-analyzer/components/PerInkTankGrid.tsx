import { Ability } from "~/components/Ability";
import { Popover } from "~/components/Popover";
import { MAX_AP } from "~/constants";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { buildStats } from "../core/stats";

interface PerInkTankGridProps {
  weaponSplId: MainWeaponId;
  subsUsed: number;
}

export function PerInkTankGrid(props: PerInkTankGridProps) {
  return (
    <Popover
      buttonChildren={<>Show consumption grid</>}
      contentClassName="analyzer__ink-grid__container"
    >
      <Grid {...props} />
    </Popover>
  );
}

// if adding to this, also update analyzer.css
const AP_VALUES_TO_SHOW = [
  0, 3, 6, 9, 10, 12, 13, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 44, 45, 47, 48, 51, 54,
  57,
];

function Grid(props: PerInkTankGridProps) {
  const values = calculateGrid(props);

  // xxx: hook up subsUsed to state, default to 1
  // xxx: grey "-" when no data
  // xxx: hover effect for cells
  // xxx: mobile
  // xxx: optimize perf?
  return (
    <div>
      <div className="stack horizontal xs justify-center">
        {[0, 1, 2].map((subsUsed) => {
          const id = String(subsUsed);
          return (
            <div key={subsUsed} className="stack horizontal xs items-center">
              <input type="radio" id={id} name="subsUsed" />
              <label htmlFor={id}>{subsUsed}</label>
            </div>
          );
        })}
      </div>
      <div className="stack horizontal sm">
        <div className="analyzer__ink-grid__horizontal-ability">
          <Ability ability="ISS" size="SUBTINY" />
        </div>
        <div className="analyzer__ink-grid">
          <div className="analyzer__ink-grid__horizontal-ability">
            <Ability ability="ISM" size="SUBTINY" />
          </div>
          <div />
          {AP_VALUES_TO_SHOW.map((ap) => (
            <div className="analyzer__ink-grid__ap" key={ap}>
              {ap}
            </div>
          ))}
          {values.map((row, i) =>
            [
              <div className="analyzer__ink-grid__ap" key={i}>
                {AP_VALUES_TO_SHOW[i]}
              </div>,
            ].concat(
              row.map((cell, i) => {
                if (cell === "N/A")
                  return <div className="analyzer__ink-grid__cell" />;
                if (!cell.shots)
                  return <div className="analyzer__ink-grid__cell">-</div>;

                return (
                  <div
                    key={i}
                    className="analyzer__ink-grid__cell"
                    style={{ "--cell-color": cell.hex } as any}
                  >
                    {cell.shots}
                  </div>
                );
              }),
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// LDE boosts both ISM and ISS by max 18 AP each, but you need 10 AP to wear it.
const MAX_LDE_AP = 18 * 2;
const AP_NEEDED_TO_WEAR_LDE = 10;
const apsArePossible = (issAP: number, ismAP: number) =>
  issAP + ismAP - MAX_LDE_AP + AP_NEEDED_TO_WEAR_LDE <= MAX_AP;
function calculateGrid({ weaponSplId, subsUsed }: PerInkTankGridProps) {
  const result: ("N/A" | { shots: number | null })[][] = [];
  for (
    let issAPIndex = 0;
    issAPIndex < AP_VALUES_TO_SHOW.length;
    issAPIndex++
  ) {
    const issAP = AP_VALUES_TO_SHOW[issAPIndex];

    const row: ("N/A" | { shots: number | null })[] = [];
    for (
      let ismAPIndex = 0;
      ismAPIndex < AP_VALUES_TO_SHOW.length;
      ismAPIndex++
    ) {
      const ismAP = AP_VALUES_TO_SHOW[ismAPIndex];

      if (!apsArePossible(issAP, ismAP)) {
        row.push("N/A" as const);
        continue;
      }

      const { stats } = buildStats({
        abilityPoints: new Map([
          ["ISS", issAP],
          ["ISM", ismAP],
        ]),
        weaponSplId,
        mainOnlyAbilities: [],
        hasTacticooler: false,
      });

      // const asd = fullInkTankOptions({
      //   abilityPoints: new Map([
      //     ["ISS", issAP],
      //     ["ISM", ismAP],
      //   ]),
      //   weaponSplId,
      //   hasTacticooler: false,
      //   mainOnlyAbilities: [],
      // })

      const option = stats.fullInkTankOptions.find(
        (o) => o.subsUsed === subsUsed,
      );

      row.push({
        shots: option?.value ? Math.floor(option.value) : null,
      });
    }

    result.push(row);
  }

  const withColors = addGridColors(result);

  return withColors;
}

function addGridColors(grid: ("N/A" | { shots: number | null })[][]) {
  const maxValue = grid
    .flat()
    .filter((v): v is { shots: number } => v !== "N/A" && v.shots !== null)
    .reduce((max, v) => Math.max(max, v.shots), 0);

  const minValue = grid
    .flat()
    .filter((v): v is { shots: number } => v !== "N/A" && v.shots !== null)
    .reduce((min, v) => Math.min(min, v.shots), Infinity);

  const result = grid.map((row) =>
    row.map((cell) => {
      if (cell === "N/A") return cell;
      if (cell.shots === null) return { ...cell, hex: undefined };

      const { shots } = cell;
      const hex = generateHexCode({
        minValue,
        maxValue,
        value: shots,
      });

      return {
        ...cell,
        hex,
      };
    }),
  );

  return result;
}

function generateHexCode({
  minValue,
  maxValue,
  value,
}: {
  minValue: number;
  maxValue: number;
  value: number;
}) {
  const clampedValue = Math.max(minValue, Math.min(value, maxValue));
  const normalizedPosition = (clampedValue - minValue) / (maxValue - minValue);

  // Adjust saturation and brightness to lighten the colors
  const saturationFactor = 0.5; // Adjust this to control the saturation
  const brightnessFactor = 0.8; // Adjust this to control the brightness

  const red =
    Math.floor(255 * (1 - normalizedPosition) * saturationFactor) +
    Math.floor(255 * (1 - brightnessFactor));
  const green =
    Math.floor(255 * normalizedPosition * saturationFactor) +
    Math.floor(255 * (1 - brightnessFactor));
  const blue = Math.floor(255 * (1 - brightnessFactor));

  const hex = ((1 << 24) | (red << 16) | (green << 8) | blue)
    .toString(16)
    .slice(1)
    .toUpperCase();

  return `#${hex}`;
}
