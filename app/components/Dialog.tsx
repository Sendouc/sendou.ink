import React from "react";
import invariant from "tiny-invariant";

export function Dialog({
  children,
  isOpen,
  close,
  className,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  close?: () => void;
  className?: string;
}) {
  const ref = useDOMSync(isOpen);

  // https://stackoverflow.com/a/26984690
  const closeOnOutsideClick = close
    ? (event: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
        const rect: DOMRect = ref.current.getBoundingClientRect();
        const isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          close();
        }
      }
    : undefined;

  return (
    <dialog className={className} ref={ref} onClick={closeOnOutsideClick}>
      {children}
    </dialog>
  );
}

function useDOMSync(isOpen: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    const dialog = ref.current;

    if (dialog.open && isOpen) return;
    if (!dialog.open && !isOpen) return;

    const html = document.getElementsByTagName("html")[0];
    invariant(html);

    if (isOpen) {
      dialog.showModal();
      // TODO: can be replaced with https://twitter.com/argyleink/status/1529869352660439048 once gets control
      html.classList.add("lock-scroll");
    } else {
      dialog.close();
      html.classList.remove("lock-scroll");
    }

    return () => {
      dialog.close();
      html.classList.remove("lock-scroll");
    };
  }, [isOpen]);

  return ref;
}
