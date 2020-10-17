import { useTranslation } from "lib/useMockT";
import React from "react";

interface FlagProps {
  code: string;
  size?: "16" | "32";
}

const Flag: React.FC<FlagProps> = ({ code, size = "16" }) => {
  const { t } = useTranslation();
  return (
    <img
      src={`https://www.countryflags.io/${code}/flat/${size}.png`}
      style={{
        display: "inline",
        margin: "0 8px",
        width: `${size}px`,
        height: `${size}px`,
      }}
      alt={t(`countries;${code.toUpperCase()}`)}
      title={t(`countries;${code.toUpperCase()}`)}
    />
  );
};

export default Flag;
