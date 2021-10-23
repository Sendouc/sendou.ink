import { App } from "@tinyhttp/app";

const app = new App();

app.get("/", (req, res) => res.send("Welcome"));

export default app;
