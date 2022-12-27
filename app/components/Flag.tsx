export function Flag({ countryCode }: { countryCode: string }) {
  return <div className={`twf twf-${countryCode.toLowerCase()}`} />;
}
