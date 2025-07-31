import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import api from "./router/api.js";

const app = new Hono()
  .use(
    "*",
    cors({
      origin: "*",
    })
  )
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .route("/api", api);

showRoutes(app);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export type ApiType = typeof app;
