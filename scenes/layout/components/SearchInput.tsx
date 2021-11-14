import { SearchIcon } from "../../../components/icons/Search";
import s from "../styles/SearchInput.module.css";

export function SearchInput() {
  return (
    <div class={s.searchInputContainer}>
      <input class={s.searchInput} type="text" placeholder="Search" />
      <SearchIcon class={s.searchInputIcon} />
    </div>
  );
}
