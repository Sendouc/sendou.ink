import clsx from "clsx";
import { MyLabel } from "./ui/MyLabel";

type LabelProps = Pick<
	React.DetailedHTMLProps<
		React.LabelHTMLAttributes<HTMLLabelElement>,
		HTMLLabelElement
	>,
	"children" | "htmlFor"
> & {
	valueLimits?: {
		current: number;
		max: number;
	};
	required?: boolean;
	className?: string;
	labelClassName?: string;
	spaced?: boolean;
};

// TODO: replace with MyLabel
export function Label({
	valueLimits,
	required,
	children,
	htmlFor,
	className,
	labelClassName,
	spaced = true,
}: LabelProps) {
	return (
		<div
			className={clsx("label__container", className, {
				"mb-0-forced": !spaced,
			})}
		>
			<MyLabel spaced htmlFor={htmlFor} className={labelClassName}>
				{children} {required && <span className="text-error">*</span>}
			</MyLabel>
			{valueLimits ? (
				<div className={clsx("label__value", lengthWarning(valueLimits))}>
					{valueLimits.current}/{valueLimits.max}
				</div>
			) : null}
		</div>
	);
}

function lengthWarning(valueLimits: NonNullable<LabelProps["valueLimits"]>) {
	if (valueLimits.current >= valueLimits.max) return "error";
	if (valueLimits.current / valueLimits.max >= 0.9) return "warning";

	return;
}
