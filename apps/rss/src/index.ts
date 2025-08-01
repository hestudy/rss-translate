import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { api } from "api/convex";
import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { Hono } from "hono";
import z from "zod";

const app = new Hono();
const client = new ConvexClient("http://127.0.0.1:3210");

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/rss",
  zValidator(
    "query",
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const query = c.req.valid("query");
    // api.feedItems
    // client.onUpdate(api.feeds.)
  }
);

serve(
  {
    fetch: app.fetch,
    port: 3002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
