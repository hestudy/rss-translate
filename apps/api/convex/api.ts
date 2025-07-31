import { v } from "convex/values";
import { client, workflow } from ".";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

export const parserRss = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await client.api.parseRss.$get({
      query: {
        url: args.url,
      },
    });
    const json = await res.json();
    return json;
  },
});

export const saveRss = internalMutation({
  args: {
    feedId: v.id("feeds"),
    feed: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.feedId, {
      title: args.feed.title,
      description: args.feed.description,
      link: args.feed.link,
    });
  },
});

export const scrapyFeedWorkflow = workflow.define({
  args: {
    feedUrl: v.string(),
    feedId: v.id("feeds"),
  },
  handler: async (step, args) => {
    const feed = await step.runAction(internal.api.parserRss, {
      url: args.feedUrl,
    });
    await step.runMutation(internal.api.saveRss, {
      feedId: args.feedId,
      feed,
    });
  },
});

export const startScrapyWorkflow = internalMutation({
  args: {
    feedUrl: v.string(),
    feedId: v.id("feeds"),
  },
  handler: async (ctx, args) => {
    const workflowId = await workflow.start(
      ctx,
      internal.api.scrapyFeedWorkflow,
      {
        feedUrl: args.feedUrl,
        feedId: args.feedId,
      }
    );
    await ctx.db.patch(args.feedId, {
      workflowId,
    });
  },
});
