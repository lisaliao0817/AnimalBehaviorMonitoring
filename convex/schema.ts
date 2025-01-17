import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
    organizations: defineTable({
        name: v.string(),
        address: v.string(),
        contactEmail: v.string(),
        // You might want to store other org details like:
        // phone: v.string(),
        // website: v.optional(v.string()),
        createdAt: v.string(),
    }).index("by_name", ["name"]),

    sessions: defineTable({
        userId: v.id("staff"),
        token: v.string(),
        expiresAt: v.string(),
     }).index("by_token", ["token"]),

    staff: defineTable({
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.union(v.literal("admin"), v.literal("researcher"), v.literal("volunteer")),
        organizationId: v.id("organizations"),
        status: v.union(v.literal("pending"), v.literal("active"), v.literal("inactive")),
        createdAt: v.string(),
    }).index("by_email", ["email"])
      .index("by_organization", ["organizationId"]),

    organizationInvites: defineTable({
        email: v.string(),
        organizationId: v.id("organizations"),
        role: v.union(v.literal("researcher"), v.literal("volunteer")),
        inviteCode: v.string(),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
        expiresAt: v.string(),
        createdAt: v.string(),
    }).index("by_email", ["email"])
      .index("by_invite_code", ["inviteCode"]),

    behaviors: defineTable({
        animal: v.string(),
        behavior: v.string(),
        createdAt: v.string(),
        description: v.string(),
        organizationId: v.id("organizations"),
        staffId: v.id("staff"),
    }).index("by_organization", ["organizationId"]),
});
