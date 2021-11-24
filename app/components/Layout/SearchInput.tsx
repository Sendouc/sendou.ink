import classNames from "classnames";
import { SearchIcon } from "../../components/icons/Search";

export function SearchInput() {
  return (
    <div className={"layout__search-input__container"}>
      <input
        className={classNames("plain", "layout__search-input")}
        type="text"
        placeholder="Search"
      />
      <SearchIcon className="layout__search-input__icon" />
    </div>
  );
}
