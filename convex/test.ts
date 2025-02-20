import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Define the expected identity type
type Identity = {
  tokenIdentifier: string;
  userId: Id<"staff">;
  organizationId: Id<"organizations">;
  role: string;
};

export const createBehavior = mutation({
  args: {
    animal: v.string(),
    behavior: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity() as Identity | null;
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.db.insert("behaviors", {
      ...args,
      organizationId: identity.organizationId,
      staffId: identity.userId,
      createdAt: new Date().toISOString(),
    });
  },
});

export const getBehaviors = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity() as Identity | null;
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.db
      .query("behaviors")
      .withIndex("by_organization", (q) => 
        q.eq("organizationId", identity.organizationId)
      )
      .collect();
  },
});
  