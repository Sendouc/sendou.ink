import { useNavigate } from "@remix-run/react";
import { Dialog } from "~/components/Dialog";

export default function PlusCommentModalPage() {
  const navigate = useNavigate();
  return (
    <Dialog isOpen close={() => navigate("/plus")}>
      hello world
    </Dialog>
  );
}
