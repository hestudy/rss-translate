import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { feedWorkpool } from ".";
import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";

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
      }
    );

    await ctx.db.patch(feedId, {
      workpoolId,
    });

    return feedId;
  },
});
