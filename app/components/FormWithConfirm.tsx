import { Form } from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

export function FormWithConfirm({
  fields,
  children,
  dialogHeading,
}: {
  fields: [name: string, value: string | number][];
  children: React.ReactNode;
  dialogHeading: string;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const id = React.useId();

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  invariant(React.isValidElement(children));

  return (
    <>
      <Form id={id} className="hidden" ref={formRef} method="post">
        {fields.map(([name, value]) => (
          <input type="hidden" key={name} name={name} value={value} />
        ))}
      </Form>
      <Dialog isOpen={dialogOpen} close={closeDialog} className="text-center">
        <div className="stack md">
          <h2 className="text-sm">{dialogHeading}</h2>
          <div className="stack horizontal md justify-center">
            <Button form={id} variant="destructive" type="submit">
              Delete
            </Button>
            <Button variant="outlined" onClick={closeDialog}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
      {React.cloneElement(children, {
        // @ts-expect-error broke with @types/react upgrade. TODO: figure out narrower type than React.ReactNode
        onClick: openDialog,
      })}
    </>
  );
}
