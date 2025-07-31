import { v } from "convex/values";
import { client, feedItemWorkpool, workflow } from ".";
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
    feed: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      link: v.optional(v.string()),
      items: v.array(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedId, {
      title: args.feed.title,
      description: args.feed.description,
      link: args.feed.link,
    });

    return await Promise.all(
      args.feed.items.map(async (item) => {
        const existingItem = await ctx.db
          .query("feedItems")
          .filter((q) =>
            q.and(
              q.eq(q.field("feed"), args.feedId),
              q.eq(q.field("guid"), item.guid)
            )
          )
          .first();

        if (existingItem) {
          return;
        }

        const itemId = await ctx.db.insert("feedItems", {
          feed: args.feedId,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          creator: item.creator,
          content: item.content,
          contentSnippet: item.contentSnippet,
          guid: item.guid,
          category: item.category,
          isoDate: item.isoDate,
        });

        await feedItemWorkpool.enqueueAction(
          ctx,
          internal.feedItems.scrapyContent,
          {
            url: item.link,
            itemId,
          }
        );

        return itemId;
      })
    );
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
      feed: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        items: feed.items,
      },
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
