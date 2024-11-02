import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {animalId: v.string()},
  handler: async (ctx) => {
    return await ctx.db.query("behaviors").collect();
  },
});

export const createBehavior = mutation({
  args: {
    animal: v.string(),
    behavior: v.string(),
    description: v.string(),
    createdAt: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("behaviors", args);
  },
});
  