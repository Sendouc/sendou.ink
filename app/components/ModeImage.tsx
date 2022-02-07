import { Mode } from "@prisma/client";
import { modesShortToLong } from "~/core/stages/stages";
import { modeToImageUrl } from "~/utils";

export interface ModeImageProps
  extends React.ButtonHTMLAttributes<HTMLImageElement> {
  mode: Mode;
}

export function ModeImage({ mode, ...props }: ModeImageProps) {
  return (
    <img
      src={modeToImageUrl(mode)}
      alt={modesShortToLong[mode]}
      title={modesShortToLong[mode]}
      {...props}
    />
  );
}
