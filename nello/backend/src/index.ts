import { buildApp } from "./app.js";

const app = await buildApp();

const port = Number(process.env.PORT || 6502);

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Nello backend listening on port ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { app };