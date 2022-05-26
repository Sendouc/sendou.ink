import React from "react";

export function Dialog({
  children,
  isOpen,
  close,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  close: () => void;
}) {
  const ref = useDOMSync(isOpen);

  // https://stackoverflow.com/a/26984690
  const closeOnOutsideClick = (
    event: React.MouseEvent<HTMLDialogElement, MouseEvent>
  ) => {
    const rect: DOMRect = ref.current.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      close();
    }
  };

  return (
    <dialog ref={ref} onClick={closeOnOutsideClick}>
      <button onClick={close}>x</button>
      {children}
    </dialog>
  );
}

function useDOMSync(isOpen: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    if (ref.current.open && isOpen) return;
    if (!ref.current.open && !isOpen) return;

    const html = document.getElementsByTagName("html")[0];

    if (isOpen) {
      ref.current.showModal();
      html.classList.add("lock-scroll");
    } else {
      ref.current.close();
      html.classList.remove("lock-scroll");
    }

    return () => {
      html.classList.remove("lock-scroll");
    };
  }, [isOpen]);

  return ref;
}
