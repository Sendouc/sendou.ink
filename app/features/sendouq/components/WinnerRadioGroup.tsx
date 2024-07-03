import clsx from "clsx";
import { Radio, RadioGroup } from "react-aria-components";
import { useTranslation } from "react-i18next";
import type { Side } from "../q-types";

interface WinnerRadioGroupProps {
	id: string;
	value: Side | null;
	onChange: (winner: Side) => void;
	ownSide: Side | null;
}

export function WinnerRadioGroup({
	id,
	value,
	onChange,
	ownSide,
}: WinnerRadioGroupProps) {
	return (
		<RadioGroup
			aria-labelledby={id}
			className="q-match__winner-radios"
			value={value}
			onChange={(value) => onChange(value as Side)}
			orientation="horizontal"
		>
			<WinnerRadio
				side="ALPHA"
				relative={
					ownSide === "ALPHA" ? "US" : ownSide === "BRAVO" ? "THEM" : undefined
				}
			/>
			<WinnerRadio
				side="BRAVO"
				relative={
					ownSide === "BRAVO" ? "US" : ownSide === "ALPHA" ? "THEM" : undefined
				}
			/>
		</RadioGroup>
	);
}

function WinnerRadio({
	side,
	relative,
}: { side: Side; relative?: "US" | "THEM" }) {
	const { t } = useTranslation(["q"]);

	return (
		<Radio
			value={side}
			className={({ isSelected, isFocusVisible }) =>
				clsx("q-match__winner-radios__radio", {
					"q-match__winner-radios__alpha": side === "ALPHA",
					"q-match__winner-radios__bravo": side === "BRAVO",
					"q-match__winner-radios__radio__selected": isSelected,
					"q-match__winner-radios__radio__focus-visible": isFocusVisible,
				})
			}
		>
			<div className="q-match__winner-radios__side-text">
				{t(`q:match.sides.${side.toLowerCase()}`)}{" "}
				{relative ? (
					<span
						className={clsx("q-match__winner-radios__relative-text", {
							"q-match__winner-radios__relative-us": relative === "US",
							"q-match__winner-radios__relative-opponent": relative === "THEM",
						})}
					>
						{relative === "US"
							? t("q:match.sides.us")
							: t("q:match.sides.them")}
					</span>
				) : null}
			</div>
		</Radio>
	);
}
