import { render } from "solid-js/web";

import "normalize.css";
import "./styles/global.css";
import App from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
