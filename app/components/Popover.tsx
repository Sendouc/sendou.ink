import { Popover as HeadlessPopover } from "@headlessui/react";
import type { Placement } from "@popperjs/core";
import * as React from "react";
import { usePopper } from "react-popper";

// TODO: after clicking item in the pop over panel should close it
export function Popover({
  children,
  buttonChildren,
  triggerClassName,
  containerClassName,
  placement,
}: {
  children: React.ReactNode;
  buttonChildren: React.ReactNode;
  triggerClassName?: string;
  containerClassName?: string;
  placement?: Placement;
}) {
  const [referenceElement, setReferenceElement] = React.useState();
  const [popperElement, setPopperElement] = React.useState();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  return (
    <HeadlessPopover className={containerClassName}>
      <HeadlessPopover.Button
        // @ts-expect-error Popper docs: https://popper.js.org/react-popper/v2/
        ref={setReferenceElement}
        className={triggerClassName ?? "minimal tiny"}
      >
        {buttonChildren}
      </HeadlessPopover.Button>

      <HeadlessPopover.Panel
        // @ts-expect-error Popper docs: https://popper.js.org/react-popper/v2/
        ref={setPopperElement}
        className="popover-content"
        style={styles["popper"]}
        {...attributes["popper"]}
      >
        {children}
      </HeadlessPopover.Panel>
    </HeadlessPopover>
  );
}
