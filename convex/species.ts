import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get species by ID
export const getById = query({
  args: { id: v.id("species") },
  handler: async (ctx, args) => {
    const species = await ctx.db.get(args.id);
    return species;
  },
});

// Get all species for an organization with pagination
export const getByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { organizationId, limit, cursor } = args;
    
    const species = await ctx.db
      .query("species")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return species;
  },
});

// Create a new species
export const createSpecies = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { name, description, organizationId, userId } = args;
    
    // Verify user belongs to organization
    const user = await ctx.db.get(userId);
    if (!user || user.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }
    
    const speciesId = await ctx.db.insert("species", {
      name,
      description,
      organizationId,
      createdAt: Date.now(),
      createdBy: userId,
    });
    
    return { speciesId };
  },
});

// Update a species
export const updateSpecies = mutation({
  args: {
    id: v.id("species"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, name, description, userId } = args;
    
    // Get species
    const species = await ctx.db.get(id);
    if (!species) {
      throw new Error("Species not found");
    }
    
    // Verify user belongs to organization
    const user = await ctx.db.get(userId);
    if (!user || user.organizationId !== species.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Update fields
    const updates: Partial<{
      name: string;
      description: string | undefined;
    }> = {};
    
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Delete a species
export const deleteSpecies = mutation({
  args: {
    id: v.id("species"),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, userId } = args;
    
    // Get species
    const species = await ctx.db.get(id);
    if (!species) {
      throw new Error("Species not found");
    }
    
    // Verify user belongs to organization
    const user = await ctx.db.get(userId);
    if (!user || user.organizationId !== species.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Check if there are animals of this species
    const animals = await ctx.db
      .query("animals")
      .withIndex("by_speciesId", (q) => q.eq("speciesId", id))
      .first();
    
    if (animals) {
      throw new Error("Cannot delete species with existing animals");
    }
    
    await ctx.db.delete(id);
    
    return { success: true };
  },
});

// Count species by organization
export const countByOrganization = query({
  args: { 
    organizationId: v.id("organizations")
  },
  handler: async (ctx, args) => {
    const { organizationId } = args;
    
    const speciesList = await ctx.db
      .query("species")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect();
    
    return speciesList.length;
  },
}); 