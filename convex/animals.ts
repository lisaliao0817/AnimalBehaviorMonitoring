import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get animal by ID
export const getById = query({
  args: { id: v.id("animals") },
  handler: async (ctx, args) => {
    const animal = await ctx.db.get(args.id);
    return animal;
  },
});

// Get all animals for an organization with pagination
export const getByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { organizationId, limit, cursor } = args;
    
    const animals = await ctx.db
      .query("animals")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return animals;
  },
});

// Get animals by species with pagination
export const getBySpecies = query({
  args: { 
    speciesId: v.id("species"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { speciesId, limit, cursor } = args;
    
    const animals = await ctx.db
      .query("animals")
      .withIndex("by_speciesId", (q) => q.eq("speciesId", speciesId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return animals;
  },
});

// Create a new animal
export const createAnimal = mutation({
  args: {
    name: v.string(),
    speciesId: v.id("species"),
    organizationId: v.id("organizations"),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("unknown"))),
    identificationNumber: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("released"), v.literal("deceased")),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { 
      name, 
      speciesId, 
      organizationId, 
      dateOfBirth, 
      gender, 
      identificationNumber, 
      status, 
      userId 
    } = args;
    
    // Verify user belongs to organization
    const user = await ctx.db.get(userId);
    if (!user || user.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Verify species exists and belongs to organization
    const species = await ctx.db.get(speciesId);
    if (!species || species.organizationId !== organizationId) {
      throw new Error("Invalid species");
    }
    
    const animalId = await ctx.db.insert("animals", {
      name,
      speciesId,
      organizationId,
      dateOfBirth,
      gender,
      identificationNumber,
      status,
      createdAt: Date.now(),
      createdBy: userId,
    });
    
    return { animalId };
  },
});

// Update an animal
export const updateAnimal = mutation({
  args: {
    id: v.id("animals"),
    name: v.optional(v.string()),
    speciesId: v.optional(v.id("species")),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("unknown"))),
    identificationNumber: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("released"), v.literal("deceased"))),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { 
      id, 
      name, 
      speciesId, 
      dateOfBirth, 
      gender, 
      identificationNumber, 
      status, 
      userId 
    } = args;
    
    // Get animal
    const animal = await ctx.db.get(id);
    if (!animal) {
      throw new Error("Animal not found");
    }
    
    // Verify user belongs to organization
    const user = await ctx.db.get(userId);
    if (!user || user.organizationId !== animal.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // If speciesId is provided, verify it belongs to organization
    if (speciesId) {
      const species = await ctx.db.get(speciesId);
      if (!species || species.organizationId !== animal.organizationId) {
        throw new Error("Invalid species");
      }
    }
    
    // Update fields
    const updates: Partial<{
      name: string;
      speciesId: Id<"species">;
      dateOfBirth: number | undefined;
      gender: "male" | "female" | "unknown" | undefined;
      identificationNumber: string | undefined;
      status: "active" | "released" | "deceased";
    }> = {};
    
    if (name) updates.name = name;
    if (speciesId) {
      updates.speciesId = speciesId;
    }
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updates.gender = gender;
    if (identificationNumber !== undefined) updates.identificationNumber = identificationNumber;
    if (status) updates.status = status;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Delete an animal
export const deleteAnimal = mutation({
  args: {
    id: v.id("animals"),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, userId } = args;
    
    // Get animal
    const animal = await ctx.db.get(id);
    if (!animal) {
      throw new Error("Animal not found");
    }
    
    // Verify user belongs to organization
    const user = await ctx.db.get(userId);
    if (!user || user.organizationId !== animal.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Check if there are behaviors or body exams for this animal
    const behaviors = await ctx.db
      .query("behaviors")
      .withIndex("by_animalId", (q) => q.eq("animalId", id))
      .first();
    
    const bodyExams = await ctx.db
      .query("bodyExams")
      .withIndex("by_animalId", (q) => q.eq("animalId", id))
      .first();
    
    if (behaviors || bodyExams) {
      throw new Error("Cannot delete animal with existing records");
    }
    
    await ctx.db.delete(id);
    
    return { success: true };
  },
});

// Count animals by organization
export const countByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const { organizationId } = args;
    
    const animals = await ctx.db
      .query("animals")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect();
    
    return animals.length;
  },
}); 