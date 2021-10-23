import { App } from "@tinyhttp/app";
import tournament from "./tournaments.routes";

const routes = new App();

routes.use("/tournaments", tournament);

export default routes;
