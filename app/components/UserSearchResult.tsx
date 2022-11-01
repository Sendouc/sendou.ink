import { type LinksFunction } from "@remix-run/node";
import { USER_SEARCH_PAGE } from "~/utils/urls";
import clsx from "clsx";
import styles from "~/styles/u.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export function UserSearchResult() {
  //TODO: make this dynamic, this is just a placeholder
  const discordUsername = "Sendou#4059";
  const discordId = String(79237403620945920);
  const twitterHandle = "Sendouc";

  return (
    <div className={clsx("")}>
      {/* Left side, profile picture */}
      <a href="http://www.google.ca">
        <span className="chakra-avatar css-1y6t5e9">
          <img
            src="https://cdn.discordapp.com/avatars/127265908056915968/a3b2fbe2749796df6176dcaaa1349f59.jpg?size=40"
            alt="David"
            className="chakra-avatar__img css-3a5bz2"
          />
        </span>
      </a>

      {/* Right side */}
      <div className="css-1q8b5yy">
        {/* Discord Username */}
        <div className="css-lrfoj5o">
          <a
            className="chakra-link css-f4h6uy"
            href={`${USER_SEARCH_PAGE}/${discordId}`}
          >
            {discordUsername}
          </a>
        </div>

        {/* Twitter */}
        <div className="css-kte2mz">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="css-11bknqq"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
          </svg>
          <a
            className="chakra-link css-f4h6uy"
            href={`https://twitter.com/${twitterHandle}`}
          >
            {twitterHandle}
          </a>
        </div>
      </div>
    </div>
  );
}
