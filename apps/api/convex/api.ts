import { v } from "convex/values";
import { client, feedItemWorkpool, translateTextWorkpool, workflow } from ".";
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
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedId, {
      title: args.feed.title,
      description: args.feed.description,
      link: args.feed.link,
    });

    if (args.feed.title) {
      const workpoolId = await translateTextWorkpool.enqueueAction(
        ctx,
        internal.feeds.translateTitle,
        {
          feedId: args.feedId,
          title: args.feed.title,
        }
      );
      await ctx.db.patch(args.feedId, {
        translateTitleWorkpoolId: workpoolId,
      });
    }

    if (args.feed.description) {
      const workpoolId = await translateTextWorkpool.enqueueAction(
        ctx,
        internal.feeds.translateDescription,
        {
          feedId: args.feedId,
          description: args.feed.description,
        }
      );
      await ctx.db.patch(args.feedId, {
        translateDescriptionWorkpoolId: workpoolId,
      });
    }

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
          user: args.userId,
        });

        const workpoolId = await feedItemWorkpool.enqueueAction(
          ctx,
          internal.feedItems.scrapyContent,
          {
            url: item.link,
            itemId,
          }
        );

        await ctx.db.patch(itemId, {
          scrapyContentWorkpoolId: workpoolId,
        });

        if (item.contentSnippet) {
          const translateWorkpoolId = await translateTextWorkpool.enqueueAction(
            ctx,
            internal.feedItems.translateTextContent,
            {
              itemId,
              content: item.contentSnippet,
            }
          );

          await ctx.db.patch(itemId, {
            translateContentSnippetWorkpoolId: translateWorkpoolId,
          });
        }

        return itemId;
      })
    );
  },
});

export const scrapyFeedWorkflow = workflow.define({
  args: {
    feedUrl: v.string(),
    feedId: v.id("feeds"),
    userId: v.id("users"),
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
      userId: args.userId,
    });
  },
});

export const startScrapyWorkflow = internalMutation({
  args: {
    feedUrl: v.string(),
    feedId: v.id("feeds"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workflowId = await workflow.start(
      ctx,
      internal.api.scrapyFeedWorkflow,
      {
        feedUrl: args.feedUrl,
        feedId: args.feedId,
        userId: args.userId,
      }
    );
    await ctx.db.patch(args.feedId, {
      workflowId,
    });
  },
});
