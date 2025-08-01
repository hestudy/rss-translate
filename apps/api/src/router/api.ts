import { zValidator } from "@hono/zod-validator";
import { beautifyDomByUrl, translateHtml, translateText } from "common";
import { Hono } from "hono";
import OpenAI from "openai";
import Parser from "rss-parser";
import z from "zod";
import convexClient from "../lib/convexClient.js";
import { api as convexApi } from "../../convex/_generated/api.js";

const parser = new Parser();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
});

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
  )
  .post(
    "/translateHtml",
    zValidator(
      "json",
      z.object({
        html: z.string(),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const result = await translateHtml(body.html, openai);
      return c.text(result);
    }
  )
  .post(
    "/translateText",
    zValidator(
      "json",
      z.object({
        text: z.string(),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const result = await translateText(body.text, openai);
      return c.text(result ?? "");
    }
  )
  .get(
    "/rss",
    zValidator(
      "query",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const query = c.req.valid("query");
      const result = await convexClient.query(convexApi.feeds.rssData, {
        feedId: query.id,
      });
    }
  );

export default api;
