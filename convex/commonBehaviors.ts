import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get common behavior by ID
export const getById = query({
  args: { id: v.id("commonBehaviors") },
  handler: async (ctx, args) => {
    const commonBehavior = await ctx.db.get(args.id);
    return commonBehavior;
  },
});

// Get common behaviors for an organization with pagination and filtering
export const getByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.number(),
    cursor: v.optional(v.string()),
    speciesId: v.optional(v.id("species")),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { 
      organizationId, 
      limit, 
      cursor, 
      speciesId, 
      searchTerm 
    } = args;
    
    let query = ctx.db
      .query("commonBehaviors")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId));
    
    // Apply filters
    if (speciesId) {
      query = ctx.db
        .query("commonBehaviors")
        .withIndex("by_speciesId", (q) => q.eq("speciesId", speciesId))
        .filter((q) => q.eq(q.field("organizationId"), organizationId));
    }
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("name"), searchTerm),
          q.eq(q.field("description"), searchTerm)
        )
      );
    }
    
    const commonBehaviors = await query
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return commonBehaviors;
  },
});

// Get common behaviors for a specific species
export const getBySpecies = query({
  args: { 
    speciesId: v.id("species"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { speciesId, limit, cursor } = args;
    
    const commonBehaviors = await ctx.db
      .query("commonBehaviors")
      .withIndex("by_speciesId", (q) => q.eq("speciesId", speciesId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return commonBehaviors;
  },
});

// Create a new common behavior
export const create = mutation({
  args: {
    name: v.string(),
    speciesId: v.id("species"),
    description: v.string(),
    organizationId: v.id("organizations"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { 
      name, 
      speciesId, 
      description, 
      organizationId, 
      staffId 
    } = args;
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Verify species exists and belongs to organization
    const species = await ctx.db.get(speciesId);
    if (!species || species.organizationId !== organizationId) {
      throw new Error("Invalid species");
    }
    
    const commonBehaviorId = await ctx.db.insert("commonBehaviors", {
      name,
      speciesId,
      description,
      organizationId,
      createdBy: staffId,
      createdAt: Date.now(),
    });
    
    return { commonBehaviorId };
  },
});

// Update a common behavior
export const update = mutation({
  args: {
    id: v.id("commonBehaviors"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, name, description, staffId } = args;
    
    // Get common behavior record
    const commonBehavior = await ctx.db.get(id);
    if (!commonBehavior) {
      throw new Error("Common behavior not found");
    }
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== commonBehavior.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Update fields
    const updates: Partial<{
      name: string;
      description: string;
    }> = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Delete a common behavior
export const delete_ = mutation({
  args: {
    id: v.id("commonBehaviors"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, staffId } = args;
    
    // Get common behavior record
    const commonBehavior = await ctx.db.get(id);
    if (!commonBehavior) {
      throw new Error("Common behavior not found");
    }
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== commonBehavior.organizationId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(id);
    
    return { success: true };
  },
}); 