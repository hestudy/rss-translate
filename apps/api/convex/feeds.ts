import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { client, feedWorkpool, workflow } from ".";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";

export const create = mutation({
  args: {
    feedUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingFeed = await ctx.db
      .query("feeds")
      .filter((q) =>
        q.and(
          q.eq(q.field("feedUrl"), args.feedUrl),
          q.eq(q.field("user"), userId)
        )
      )
      .first();

    if (existingFeed) {
      return existingFeed._id;
    }

    const feedId = await ctx.db.insert("feeds", {
      feedUrl: args.feedUrl,
      user: userId,
    });

    const workpoolId = await feedWorkpool.enqueueMutation(
      ctx,
      internal.api.startScrapyWorkflow,
      {
        feedUrl: args.feedUrl,
        feedId,
        userId,
      }
    );

    await ctx.db.patch(feedId, {
      workpoolId,
    });

    return feedId;
  },
});

export const page = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const feeds = await ctx.db
      .query("feeds")
      .filter((q) => q.eq(q.field("user"), userId))
      .paginate(args.paginationOpts);

    const feedsWithStatus = await Promise.all(
      feeds.page.map(async (feed) => {
        return {
          ...feed,
          workpoolStatus: feed.workflowId
            ? await feedWorkpool.status(ctx, feed.workpoolId as any)
            : null,
          workflowStatus: feed.workflowId
            ? await workflow.status(ctx, feed.workflowId as any)
            : null,
        };
      })
    );

    return {
      ...feeds,
      page: feedsWithStatus,
    };
  },
});

export const read = query({
  args: {
    feedId: v.id("feeds"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const feed = await ctx.db
      .query("feeds")
      .filter((q) =>
        q.and(q.eq(q.field("_id"), args.feedId), q.eq(q.field("user"), userId))
      )
      .first();

    if (!feed) {
      throw new Error("Feed not found");
    }

    return feed;
  },
});

export const deleteFeed = mutation({
  args: {
    feedId: v.id("feeds"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const feed = await ctx.db
      .query("feeds")
      .filter((q) =>
        q.and(q.eq(q.field("_id"), args.feedId), q.eq(q.field("user"), userId))
      )
      .first();

    if (!feed) {
      throw new Error("Feed not found");
    }

    return await ctx.db.delete(args.feedId);
  },
});

export const update = mutation({
  args: {
    feedId: v.id("feeds"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const feed = await ctx.db
      .query("feeds")
      .filter((q) =>
        q.and(q.eq(q.field("_id"), args.feedId), q.eq(q.field("user"), userId))
      )
      .first();

    if (!feed) {
      throw new Error("Feed not found");
    }

    return await ctx.db.patch(args.feedId, {
      title: args.title,
      description: args.description,
    });
  },
});

export const translateTitle = internalAction({
  args: {
    feedId: v.id("feeds"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await client.api.translateText.$post({
      json: {
        text: args.title,
      },
    });
    const text = await res.text();
    if (text) {
      await ctx.runMutation(internal.feeds.saveTranslateTitle, {
        feedId: args.feedId,
        title: text,
      });
    }
  },
});

export const saveTranslateTitle = internalMutation({
  args: {
    feedId: v.id("feeds"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.feedId, {
      translateTitle: args.title,
    });
  },
});

export const translateDescription = internalAction({
  args: {
    feedId: v.id("feeds"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await client.api.translateText.$post({
      json: {
        text: args.description,
      },
    });
    const text = await res.text();
    if (text) {
      await ctx.runMutation(internal.feeds.saveTranslateDescription, {
        feedId: args.feedId,
        description: text,
      });
    }
  },
});

export const saveTranslateDescription = internalMutation({
  args: {
    feedId: v.id("feeds"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.feedId, {
      translateDescription: args.description,
    });
  },
});

export const rssData = query({
  args: {
    feedId: v.id("feeds"),
  },
  handler: async (ctx, args) => {
    const feed = await ctx.db.get(args.feedId);
    const items = await ctx.db
      .query("feedItems")
      .filter((q) => q.eq(q.field("feed"), args.feedId))
      .collect();
    return {
      ...feed,
      items,
    };
  },
});
