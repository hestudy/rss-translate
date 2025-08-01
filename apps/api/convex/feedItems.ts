import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api.js";
import {
  internalAction,
  internalMutation,
  query,
} from "./_generated/server.js";
import {
  client,
  feedItemWorkpool,
  translateHtmlWorkpool,
  translateTextWorkpool,
} from "./index.js";

export const saveScrapyContent = internalMutation({
  args: {
    itemId: v.id("feedItems"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const workpoolId = await translateHtmlWorkpool.enqueueAction(
      ctx,
      internal.feedItems.translateHtmlContent,
      {
        itemId: args.itemId,
        content: args.content,
      }
    );

    await ctx.db.patch(args.itemId, {
      translateContentWorkpoolId: workpoolId,
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

export const page = query({
  args: {
    paginationOpts: paginationOptsValidator,
    feedId: v.optional(v.id("feeds")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    let query = ctx.db
      .query("feedItems")
      .filter((q) => q.eq(q.field("user"), userId));

    if (args.feedId) {
      query = query.filter((q) => q.eq(q.field("feed"), args.feedId));
    }
    const feedItems = await query.paginate(args.paginationOpts);

    const feedItemsWithStatus = await Promise.all(
      feedItems.page.map(async (item) => {
        delete item.content;
        delete item.scrapyContent;
        delete item.translateContent;
        delete item.translateContentSnippet;
        delete item.contentSnippet;
        return {
          ...item,
          scrapyContentWorkpoolStatus: item.scrapyContentWorkpoolId
            ? await feedItemWorkpool.status(
                ctx,
                item.scrapyContentWorkpoolId as any
              )
            : null,
          translateContentWorkpoolStatus: item.translateContentWorkpoolId
            ? await translateHtmlWorkpool.status(
                ctx,
                item.translateContentWorkpoolId as any
              )
            : null,
          translateContentSnippetWorkpoolStatus:
            item.translateContentSnippetWorkpoolId
              ? await translateTextWorkpool.status(
                  ctx,
                  item.translateContentSnippetWorkpoolId as any
                )
              : null,
        };
      })
    );

    return {
      ...feedItems,
      page: feedItemsWithStatus,
    };
  },
});
