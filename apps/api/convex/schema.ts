import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  feeds: defineTable({
    feedUrl: v.string(),
    title: v.optional(v.string()),
    translateTitle: v.optional(v.string()),
    translateTitleWorkpoolId: v.optional(v.string()),
    description: v.optional(v.string()),
    translateDescription: v.optional(v.string()),
    translateDescriptionWorkpoolId: v.optional(v.string()),
    link: v.optional(v.string()),
    user: v.id("users"),
    workflowId: v.optional(v.string()),
    workpoolId: v.optional(v.string()),
  }),
  feedItems: defineTable({
    feed: v.id("feeds"),
    title: v.optional(v.string()),
    link: v.optional(v.string()),
    pubDate: v.optional(v.string()),
    creator: v.optional(v.string()),
    content: v.optional(v.string()),
    scrapyContent: v.optional(v.string()),
    scrapyContentWorkpoolId: v.optional(v.string()),
    translateContent: v.optional(v.string()),
    translateContentWorkpoolId: v.optional(v.string()),
    contentSnippet: v.optional(v.string()),
    translateContentSnippet: v.optional(v.string()),
    translateContentSnippetWorkpoolId: v.optional(v.string()),
    guid: v.optional(v.string()),
    category: v.optional(v.array(v.string())),
    isoDate: v.optional(v.string()),
    user: v.id("users"),
    isRead: v.optional(v.boolean()),
  }),
});

export default schema;
