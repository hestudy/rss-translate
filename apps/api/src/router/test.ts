import { zValidator } from "@hono/zod-validator";
import { beautifyDomByUrl } from "common";
import { Hono } from "hono";
import z from "zod";

const test = new Hono().get(
  "/beautifyDomByUrl",
  zValidator(
    "query",
    z.object({
      url: z.url(),
    })
  ),
  async (c) => {
    const query = c.req.valid("query");
    const result = await beautifyDomByUrl(query.url);
    return c.json(result);
  }
);

export default test;
