import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get organization by ID
export const getById = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.id);
    return organization;
  },
});

// Get organization by invite code
export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
    
    return organization;
  },
});

// Create a new organization (public version)
export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    inviteCode: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("organizations", {
      name: args.name,
      address: args.address,
      inviteCode: args.inviteCode,
      email: args.email,
      createdAt: Date.now(),
    });
  },
});

// Update organization
export const updateOrganization = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    email: v.optional(v.string()),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, name, address, email, userId } = args;
    
    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin" || user.organizationId !== id) {
      throw new Error("Unauthorized");
    }
    
    // Update fields
    const updates: Partial<{
      name: string;
      address: string;
      email: string;
    }> = {};
    
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (email) updates.email = email;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Generate new invite code
export const generateNewInviteCode = mutation({
  args: {
    id: v.id("organizations"),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, userId } = args;
    
    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin" || user.organizationId !== id) {
      throw new Error("Unauthorized");
    }
    
    // Generate new invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    await ctx.db.patch(id, { inviteCode });
    
    return { inviteCode };
  },
});

// Internal functions
export const internal = {
  // Create a new organization
  create: mutation({
    args: {
      name: v.string(),
      address: v.string(),
      inviteCode: v.string(),
      email: v.string(),
    },
    handler: async (ctx, args): Promise<Id<"organizations">> => {
      return await ctx.db.insert("organizations", {
        name: args.name,
        address: args.address,
        inviteCode: args.inviteCode,
        email: args.email,
        createdAt: Date.now(),
      });
    },
  }),
}; 