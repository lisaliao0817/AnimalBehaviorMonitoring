import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    address: v.string(),
    email: v.string(),
    inviteCode: v.string(),
    createdAt: v.number(), // Unix timestamp
  }).index("by_email", ["email"]).index("by_inviteCode", ["inviteCode"]),

  staff: defineTable({
    name: v.string(),
    email: v.string(),
    hashedPassword: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    organizationId: v.id("organizations"),
    createdAt: v.number(), // Unix timestamp
  }).index("by_email", ["email"])
    .index("by_organizationId", ["organizationId"]),

  species: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    createdAt: v.number(), // Unix timestamp
    createdBy: v.id("staff"),
  }).index("by_organizationId", ["organizationId"]),

  animals: defineTable({
    name: v.string(),
    speciesId: v.id("species"),
    organizationId: v.id("organizations"),
    dateOfBirth: v.optional(v.number()), // Unix timestamp
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("unknown"))),
    identificationNumber: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("released"), v.literal("deceased")),
    createdAt: v.number(), // Unix timestamp
    createdBy: v.id("staff"),
  }).index("by_organizationId", ["organizationId"])
    .index("by_speciesId", ["speciesId"]),

  behaviors: defineTable({
    animalId: v.id("animals"),
    behavior: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    organizationId: v.id("organizations"),
    staffId: v.id("staff"),
    createdAt: v.number(), // Unix timestamp
  }).index("by_organizationId", ["organizationId"])
    .index("by_staffId", ["staffId"])
    .index("by_animalId", ["animalId"])
    .index("by_createdAt", ["createdAt"]),

  bodyExams: defineTable({
    animalId: v.id("animals"),
    weight: v.optional(v.number()),
    diagnosis: v.optional(v.string()),
    notes: v.optional(v.string()),
    organizationId: v.id("organizations"),
    staffId: v.id("staff"),
    createdAt: v.number(), // Unix timestamp
  }).index("by_organizationId", ["organizationId"])
    .index("by_staffId", ["staffId"])
    .index("by_animalId", ["animalId"])
    .index("by_createdAt", ["createdAt"]),
});
