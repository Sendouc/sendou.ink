import clsx from "clsx";
import { Label, type LabelProps } from "react-aria-components";

interface MyLabelProps extends LabelProps {
	spaced?: boolean;
}

export function MyLabel(props: MyLabelProps) {
	const { className, spaced, ...rest } = props;

	return (
		<Label
			className={clsx("my-label", { "my-label__spaced": spaced }, className)}
			{...rest}
		/>
	);
}
