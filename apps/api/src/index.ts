import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import test from "./router/test.js";
import { cors } from "hono/cors";

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
  .route("/test", test);

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
