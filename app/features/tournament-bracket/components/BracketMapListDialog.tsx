import { Dialog } from "~/components/Dialog";

export function BracketMapListDialog({
  isOpen,
  close,
}: {
  isOpen: boolean;
  close: () => void;
}) {
  return (
    <Dialog isOpen={isOpen} close={close}>
      test
    </Dialog>
  );
}
