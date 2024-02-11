import { Popover } from "./Popover";

export function InfoPopover({ children }: { children: React.ReactNode }) {
  return (
    <Popover buttonChildren={<>?</>} triggerClassName="info-popover__trigger">
      {children}
    </Popover>
  );
}
