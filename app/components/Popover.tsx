import { Popover as HeadlessPopover } from "@headlessui/react";
import type { Placement } from "@popperjs/core";
import clsx from "clsx";
import * as React from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { useIsMounted } from "~/hooks/useIsMounted";

// TODO: after clicking item in the pop over panel should close it
export function Popover({
  children,
  buttonChildren,
  triggerClassName,
  triggerTestId,
  containerClassName,
  contentClassName,
  placement,
}: {
  children: React.ReactNode;
  buttonChildren: React.ReactNode;
  triggerClassName?: string;
  triggerTestId?: string;
  containerClassName?: string;
  contentClassName?: string;
  placement?: Placement;
}) {
  const [referenceElement, setReferenceElement] = React.useState();
  const isMounted = useIsMounted();
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
        data-testid={triggerTestId}
      >
        {buttonChildren}
      </HeadlessPopover.Button>

      {isMounted
        ? createPortal(
            <HeadlessPopover.Panel
              // @ts-expect-error Popper docs: https://popper.js.org/react-popper/v2/
              ref={setPopperElement}
              className={clsx("popover-content", contentClassName)}
              style={styles["popper"]}
              {...attributes["popper"]}
            >
              {children}
            </HeadlessPopover.Panel>,
            document.body,
          )
        : null}
    </HeadlessPopover>
  );
}
