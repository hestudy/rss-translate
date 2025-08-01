import { v } from "convex/values";
import { internal } from "./_generated/api.js";
import { internalAction, internalMutation } from "./_generated/server.js";
import { client, translateHtmlWorkpool } from "./index.js";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveScrapyContent = internalMutation({
  args: {
    itemId: v.id("feedItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.itemId, {
      scrapyContent: args.content,
    });
  },
});

export const scrapyContent = internalAction({
  args: {
    url: v.string(),
    itemId: v.id("feedItems"),
  },
  handler: async (ctx, args) => {
    const res = await client.api.beautifyDomByUrl.$get({
      query: {
        url: args.url,
      },
    });
    const json = await res.json();
    if (json?.content) {
      await ctx.runMutation(internal.feedItems.saveScrapyContent, {
        itemId: args.itemId,
        content: json.content,
      });
      await translateHtmlWorkpool.enqueueAction(
        ctx,
        internal.feedItems.translateHtmlContent,
        {
          itemId: args.itemId,
          content: json.content,
        }
      );
    }
  },
});

export const saveTranslateHtmlContent = internalMutation({
  args: {
    itemId: v.id("feedItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.itemId, {
      translateContent: args.content,
    });
  },
});

export const translateHtmlContent = internalAction({
  args: {
    itemId: v.id("feedItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await client.api.translateHtml.$post({
      json: {
        html: args.content,
      },
    });
    const text = await res.text();
    await ctx.runMutation(internal.feedItems.saveTranslateHtmlContent, {
      itemId: args.itemId,
      content: text,
    });
  },
});

export const saveTranslateTextContent = internalMutation({
  args: {
    itemId: v.id("feedItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.itemId, {
      translateContentSnippet: args.content,
    });
  },
});

export const translateTextContent = internalAction({
  args: {
    itemId: v.id("feedItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await client.api.translateText.$post({
      json: {
        text: args.content,
      },
    });
    const text = await res.text();
    await ctx.runMutation(internal.feedItems.saveTranslateTextContent, {
      itemId: args.itemId,
      content: text,
    });
  },
});
