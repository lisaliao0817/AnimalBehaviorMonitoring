import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get body exam by ID
export const getById = query({
  args: { id: v.id("bodyExams") },
  handler: async (ctx, args) => {
    const bodyExam = await ctx.db.get(args.id);
    return bodyExam;
  },
});

// Get body exams for an organization with pagination and filtering
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
      .query("bodyExams")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId));
    
    // Apply filters
    if (animalId) {
      query = ctx.db
        .query("bodyExams")
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
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("diagnosis"), searchTerm),
          q.eq(q.field("notes"), searchTerm)
        )
      );
    }
    
    const bodyExams = await query
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return bodyExams;
  },
});

// Get body exams for a specific animal with pagination
export const getByAnimal = query({
  args: { 
    animalId: v.id("animals"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { animalId, limit, cursor } = args;
    
    const bodyExams = await ctx.db
      .query("bodyExams")
      .withIndex("by_animalId", (q) => q.eq("animalId", animalId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return bodyExams;
  },
});

// Get body exams for a specific staff member with pagination
export const getByStaff = query({
  args: { 
    staffId: v.id("staff"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { staffId, limit, cursor } = args;
    
    const bodyExams = await ctx.db
      .query("bodyExams")
      .withIndex("by_staffId", (q) => q.eq("staffId", staffId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return bodyExams;
  },
});

// Get body exams by date range with pagination
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
    
    const bodyExams = await ctx.db
      .query("bodyExams")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return bodyExams;
  },
});

// Create a new body exam record
export const createBodyExam = mutation({
  args: {
    animalId: v.id("animals"),
    weight: v.optional(v.number()),
    diagnosis: v.optional(v.string()),
    notes: v.optional(v.string()),
    organizationId: v.id("organizations"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { 
      animalId, 
      weight, 
      diagnosis, 
      notes, 
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
    
    const bodyExamId = await ctx.db.insert("bodyExams", {
      animalId,
      weight,
      diagnosis,
      notes,
      organizationId,
      staffId,
      createdAt: Date.now(),
    });
    
    return { bodyExamId };
  },
});

// Update a body exam record
export const updateBodyExam = mutation({
  args: {
    id: v.id("bodyExams"),
    weight: v.optional(v.number()),
    diagnosis: v.optional(v.string()),
    notes: v.optional(v.string()),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, weight, diagnosis, notes, staffId } = args;
    
    // Get body exam record
    const bodyExam = await ctx.db.get(id);
    if (!bodyExam) {
      throw new Error("Body exam record not found");
    }
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== bodyExam.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Update fields
    const updates: Partial<{
      weight: number | undefined;
      diagnosis: string | undefined;
      notes: string | undefined;
    }> = {};
    
    if (weight !== undefined) updates.weight = weight;
    if (diagnosis !== undefined) updates.diagnosis = diagnosis;
    if (notes !== undefined) updates.notes = notes;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Delete a body exam record
export const deleteBodyExam = mutation({
  args: {
    id: v.id("bodyExams"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, staffId } = args;
    
    // Get body exam record
    const bodyExam = await ctx.db.get(id);
    if (!bodyExam) {
      throw new Error("Body exam record not found");
    }
    
    // Verify staff belongs to organization
    const staff = await ctx.db.get(staffId);
    if (!staff || staff.organizationId !== bodyExam.organizationId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(id);
    
    return { success: true };
  },
});

// Count body exams by organization with optional date range
export const countByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { organizationId, startDate, endDate } = args;
    
    let examsQuery = ctx.db
      .query("bodyExams")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId));
    
    // Apply date filters if provided
    if (startDate !== undefined && endDate !== undefined) {
      examsQuery = examsQuery.filter(q => 
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      );
    } else if (startDate !== undefined) {
      examsQuery = examsQuery.filter(q => 
        q.gte(q.field("createdAt"), startDate)
      );
    } else if (endDate !== undefined) {
      examsQuery = examsQuery.filter(q => 
        q.lte(q.field("createdAt"), endDate)
      );
    }
    
    const exams = await examsQuery.collect();
    return exams.length;
  },
});

// Get body exams by IDs
export const getByIds = query({
  args: { ids: v.array(v.id("bodyExams")) },
  handler: async (ctx, args) => {
    const { ids } = args;
    
    const bodyExams = await Promise.all(
      ids.map(async (id) => await ctx.db.get(id))
    );
    
    return bodyExams.filter(Boolean); // Filter out any nulls
  },
});

// Get body exams for multiple animals by date range
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
        .query("bodyExams")
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
    const allBodyExams = results.flat();
    
    // Sort by createdAt descending
    allBodyExams.sort((a, b) => b.createdAt - a.createdAt);
    
    // Manual pagination
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const page = allBodyExams.slice(startIndex, endIndex);
    
    // Create continuation cursor if there are more results
    const continueCursor = endIndex < allBodyExams.length ? endIndex.toString() : null;
    
    return {
      page,
      continueCursor
    };
  },
}); 