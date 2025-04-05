import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get behavior by ID
export const getById = query({
  args: { id: v.id("behaviors") },
  handler: async (ctx, args) => {
    const behavior = await ctx.db.get(args.id);
    return behavior;
  },
});

// Get behaviors for an organization with pagination and filtering
export const getByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.number(),
    cursor: v.optional(v.string()),
    animalId: v.optional(v.id("animals")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { 
      organizationId, 
      limit, 
      cursor, 
      animalId, 
      startDate, 
      endDate, 
      searchTerm 
    } = args;
    
    let query = ctx.db
      .query("behaviors")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId));
    
    // Apply filters
    if (animalId) {
      query = ctx.db
        .query("behaviors")
        .withIndex("by_animalId", (q) => q.eq("animalId", animalId))
        .filter((q) => q.eq(q.field("organizationId"), organizationId));
    }
    
    if (startDate) {
      query = query.filter((q) => q.gte(q.field("createdAt"), startDate));
    }
    
    if (endDate) {
      query = query.filter((q) => q.lte(q.field("createdAt"), endDate));
    }
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("behavior"), searchTerm),
          q.eq(q.field("description"), searchTerm),
          q.eq(q.field("location"), searchTerm)
        )
      );
    }
    
    const behaviors = await query
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return behaviors;
  },
});

// Get behaviors for a specific animal with pagination
export const getByAnimal = query({
  args: { 
    animalId: v.id("animals"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { animalId, limit, cursor } = args;
    
    const behaviors = await ctx.db
      .query("behaviors")
      .withIndex("by_animalId", (q) => q.eq("animalId", animalId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return behaviors;
  },
});

// Get behaviors for a specific staff member with pagination
export const getByStaff = query({
  args: { 
    staffId: v.id("staff"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { staffId, limit, cursor } = args;
    
    const behaviors = await ctx.db
      .query("behaviors")
      .withIndex("by_staffId", (q) => q.eq("staffId", staffId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return behaviors;
  },
});

// Get behaviors by date range with pagination
export const getByDateRange = query({
  args: { 
    organizationId: v.id("organizations"),
    startDate: v.number(),
    endDate: v.number(),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { organizationId, startDate, endDate, limit, cursor } = args;
    
    const behaviors = await ctx.db
      .query("behaviors")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return behaviors;
  },
});

// Create a new behavior record
export const createBehavior = mutation({
  args: {
    animalId: v.id("animals"),
    behavior: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    organizationId: v.id("organizations"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { 
      animalId, 
      behavior, 
      description, 
      location, 
      organizationId, 
      staffId 
    } = args;
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Verify animal exists and belongs to organization
    const animal = await ctx.db.get(animalId);
    if (!animal || animal.organizationId !== organizationId) {
      throw new Error("Invalid animal");
    }
    
    const behaviorId = await ctx.db.insert("behaviors", {
      animalId,
      behavior,
      description,
      location,
      organizationId,
      staffId,
      createdAt: Date.now(),
    });
    
    return { behaviorId };
  },
});

// Update a behavior record
export const updateBehavior = mutation({
  args: {
    id: v.id("behaviors"),
    behavior: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, behavior, description, location, staffId } = args;
    
    // Get behavior record
    const behaviorRecord = await ctx.db.get(id);
    if (!behaviorRecord) {
      throw new Error("Behavior record not found");
    }
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== behaviorRecord.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Update fields
    const updates: Partial<{
      behavior: string;
      description: string | undefined;
      location: string | undefined;
    }> = {};
    
    if (behavior) updates.behavior = behavior;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Delete a behavior record
export const deleteBehavior = mutation({
  args: {
    id: v.id("behaviors"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, staffId } = args;
    
    // Get behavior record
    const behaviorRecord = await ctx.db.get(id);
    if (!behaviorRecord) {
      throw new Error("Behavior record not found");
    }
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== behaviorRecord.organizationId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(id);
    
    return { success: true };
  },
});

// Count behaviors by organization with optional date range
export const countByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { organizationId, startDate, endDate } = args;
    
    let behaviorsQuery = ctx.db
      .query("behaviors")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId));
    
    // Apply date filters if provided
    if (startDate !== undefined && endDate !== undefined) {
      behaviorsQuery = behaviorsQuery.filter(q => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      );
    } else if (startDate !== undefined) {
      behaviorsQuery = behaviorsQuery.filter(q => 
        q.gte(q.field("createdAt"), startDate)
      );
    } else if (endDate !== undefined) {
      behaviorsQuery = behaviorsQuery.filter(q => 
        q.lte(q.field("createdAt"), endDate)
      );
    }
    
    const behaviors = await behaviorsQuery.collect();
    return behaviors.length;
  },
});

// Get behaviors by IDs
export const getByIds = query({
  args: { ids: v.array(v.id("behaviors")) },
  handler: async (ctx, args) => {
    const { ids } = args;
    
    const behaviors = await Promise.all(
      ids.map(async (id) => await ctx.db.get(id))
    );
    
    return behaviors.filter(Boolean); // Filter out any nulls
  },
});

// Get behaviors for multiple animals by date range
export const getByAnimalsDateRange = query({
  args: { 
    animalIds: v.array(v.id("animals")),
    startDate: v.number(),
    endDate: v.number(),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { animalIds, startDate, endDate, limit, cursor } = args;
    
    // Build a query for each animal ID
    const queries = animalIds.map(animalId => 
      ctx.db
        .query("behaviors")
        .withIndex("by_animalId", (q) => q.eq("animalId", animalId))
        .filter((q) => 
          q.and(
            q.gte(q.field("createdAt"), startDate),
            q.lte(q.field("createdAt"), endDate)
          )
        )
    );
    
    // Execute all queries and merge results
    const results = await Promise.all(
      queries.map(query => query.collect())
    );
    
    // Flatten the array of arrays
    const allBehaviors = results.flat();
    
    // Sort by createdAt descending
    allBehaviors.sort((a, b) => b.createdAt - a.createdAt);
    
    // Manual pagination
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const page = allBehaviors.slice(startIndex, endIndex);
    
    // Create continuation cursor if there are more results
    const continueCursor = endIndex < allBehaviors.length ? endIndex.toString() : null;
    
    return {
      page,
      continueCursor
    };
  },
}); 