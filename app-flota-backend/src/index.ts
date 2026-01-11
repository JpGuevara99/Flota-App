import express from "express";
import cors from "cors";
import vehiclesRouter from "./routes/vehicles.js";
import historyRouter from "./routes/history.js";
import { env } from "./lib/env.js";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: false,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/vehicles", vehiclesRouter);
app.use("/api/history", historyRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next;
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});

