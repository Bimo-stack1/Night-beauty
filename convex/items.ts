import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please login first");
    
    return await ctx.db.insert("items", {
      ...args,
      userId,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("items")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("items")
      .withSearchIndex("search", q => 
        q.search("name", args.query).eq("userId", userId)
      )
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please login first");
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please login first");
    
    await ctx.db.delete(args.id);
  },
});
