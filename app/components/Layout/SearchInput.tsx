import * as React from "react";
import clsx from "clsx";
import { SearchIcon } from "../../components/icons/Search";

export function SearchInput() {
  // TODO: search input that searches
  if (process.env.NODE_ENV !== "development") return <div />;
  return <SearchInputDev />;
}

export function SearchInputDev() {
  const [inputValue, setInputValue] = React.useState("");

  const handleEnter = () => {
    const [action, value] = inputValue.split(":");
    if (!action || !value) return;

    let fetchUrl = "";
    switch (action) {
      case "liu": {
        fetchUrl = `/mock-auth?username=${encodeURIComponent(value)}`;
        break;
      }
      case "lit": {
        fetchUrl = `/mock-auth?team=${encodeURIComponent(value)}`;
        break;
      }
      case "seed": {
        fetchUrl = `/seed?variation=${encodeURIComponent(value)}`;
        break;
      }
      default: {
        console.error("invalid action");
        return;
      }
    }

    return fetch(fetchUrl, { method: "post" }).then((res) => {
      if (res.status === 200) location.reload();
      else {
        console.error(`http error when trying an admin action: ${res.status}`);
      }
    });
  };

  return (
    <DumbSearchInput
      value={inputValue}
      setValue={setInputValue}
      handleEnter={handleEnter}
    />
  );
}

export function DumbSearchInput({
  value,
  setValue,
  handleEnter,
}: {
  value: string;
  setValue: (newValue: string) => void;
  handleEnter: () => void;
}) {
  return (
    <div className={"layout__search-input__container"}>
      <input
        className={clsx("plain", "layout__search-input")}
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleEnter();
          }
        }}
      />
      <SearchIcon className="layout__search-input__icon" />
    </div>
  );
}
