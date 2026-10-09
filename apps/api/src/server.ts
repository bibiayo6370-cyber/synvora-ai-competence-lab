import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8000);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error("PORT number must be an integer between 0 and 65535");
}

app.listen(port, () => {
  console.log(`SYNVORA API listening on port ${port}`);
});