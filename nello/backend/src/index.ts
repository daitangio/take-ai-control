import { buildApp } from "./app.js";
import { EVENTS_ENABLED } from "./events.js";

const app = await buildApp();

const port = Number(process.env.PORT || 6502);

try {
  await app.listen({ port, host: "0.0.0.0" });
  if(EVENTS_ENABLED) {
    console.log(`Nello backend with EVENTS listening on port ${port}`);
  }else {
    console.log(`Nello backend listening on port ${port}`);
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { app };