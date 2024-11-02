import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
    behaviors: defineTable({
        animal: v.string(),
        behavior: v.string(),
        createdAt: v.string(),
        description: v.string()
    }),
    staff: defineTable({
        name: v.string(),
        role: v.string(),
        email: v.string(),
        password: v.string(),
    }).index("by_email", ["email"]),
});
