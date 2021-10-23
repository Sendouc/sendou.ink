import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import routes from "../src/routes/index";

const app = new App();

const PORT = 3000;

app
  .use(logger())
  .use(routes)
  .listen(PORT, () =>
    console.log(`Server ready at: https://localhost:${PORT}`)
  );
