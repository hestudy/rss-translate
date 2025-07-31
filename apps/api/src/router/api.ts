import { zValidator } from "@hono/zod-validator";
import { beautifyDomByUrl } from "common";
import { Hono } from "hono";
import Parser from "rss-parser";
import z from "zod";

const parser = new Parser();

const api = new Hono()
  .get(
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
  )
  .get(
    "/parseRss",
    zValidator(
      "query",
      z.object({
        url: z.url(),
      })
    ),
    async (c) => {
      const query = c.req.valid("query");
      const result = await parser.parseURL(query.url);
      return c.json(result);
    }
  );

export default api;
