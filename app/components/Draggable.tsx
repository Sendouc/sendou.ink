import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";

export function Draggable({
  id,
  disabled,
  liClassName,
  children,
}: {
  id: string;
  disabled: boolean;
  liClassName: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      className={liClassName}
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {children}
    </li>
  );
}
