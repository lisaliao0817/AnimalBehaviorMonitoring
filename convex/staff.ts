import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { hash, compare } from "bcryptjs";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Get a staff member by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("staff")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return user;
  },
});

// Get a staff member by ID
export const getById = query({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

// Get all staff members for an organization with pagination
export const getByOrganization = query({
  args: { 
    organizationId: v.id("organizations"),
    limit: v.number(),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { organizationId, limit, cursor } = args;
    
    const users = await ctx.db
      .query("staff")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .order("desc")
      .paginate({ cursor: cursor || null, numItems: limit });
    
    return users;
  },
});

// Add an internal mutation for creating staff (without password hashing)
export const internal = {
  createStaff: mutation({
    args: {
      name: v.string(),
      email: v.string(),
      hashedPassword: v.string(),
      role: v.union(v.literal('admin'), v.literal('user')),
      organizationId: v.id('organizations'),
    },
    handler: async (ctx, args) => {
      return await ctx.db.insert('staff', {
        name: args.name,
        email: args.email,
        hashedPassword: args.hashedPassword,
        role: args.role,
        organizationId: args.organizationId,
        createdAt: Date.now(),
      });
    },
  }),
  createOrganization: mutation({
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
  }),
};

// Convert createAdmin from mutation to action
export const createAdmin = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    organizationName: v.string(),
    organizationAddress: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"staff">; organizationId: Id<"organizations"> }> => {
    // Check if email already exists
    const existingUser = await ctx.runQuery(api.staff.getByEmail, { email: args.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash the password
    const hashedPassword = await hash(args.password, 10);

    // Create organization directly in the action
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create organization and user in separate steps
    // First, create the organization
    const createOrgMutation = api.organizations.create;
    const organizationId = await ctx.runMutation(createOrgMutation, {
      name: args.organizationName,
      address: args.organizationAddress,
      inviteCode,
      email: "",
    });

    // Then create the admin user
    const createStaffMutation = api.staff.create;
    const userId = await ctx.runMutation(createStaffMutation, {
      name: args.name,
      email: args.email,
      hashedPassword,
      role: 'admin',
      organizationId,
    });

    return { userId, organizationId };
  },
});

// Convert createUser from mutation to action
export const createUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"staff">; organizationId: Id<"organizations"> }> => {
    // Check if email already exists
    const existingUser = await ctx.runQuery(api.staff.getByEmail, { email: args.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Validate invite code and get organization
    const organization = await ctx.runQuery(api.organizations.getByInviteCode, {
      inviteCode: args.inviteCode,
    });

    if (!organization) {
      throw new Error('Invalid invite code');
    }

    // Hash the password
    const hashedPassword = await hash(args.password, 10);

    // Create the user
    const createStaffMutation = api.staff.create;
    const userId = await ctx.runMutation(createStaffMutation, {
      name: args.name,
      email: args.email,
      hashedPassword,
      role: 'user',
      organizationId: organization._id,
    });

    return { userId, organizationId: organization._id };
  },
});

// Create a staff member (public mutation for use by actions)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    hashedPassword: v.string(),
    role: v.union(v.literal('admin'), v.literal('user')),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('staff', {
      name: args.name,
      email: args.email,
      hashedPassword: args.hashedPassword,
      role: args.role,
      organizationId: args.organizationId,
      createdAt: Date.now(),
    });
  },
});

// Generate invite code for a new user
export const generateInviteCode = mutation({
  args: {
    email: v.string(),
    organizationId: v.id("organizations"),
    userId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { email, organizationId, userId } = args;
    
    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin" || user.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Get organization
    const organization = await ctx.db.get(organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }
    
    // Return invite code
    return { inviteCode: organization.inviteCode, email };
  },
});

// Update a staff member
export const updateStaff = mutation({
  args: {
    id: v.id("staff"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    currentUserId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, name, email, currentUserId } = args;
    
    // Get current user
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) {
      throw new Error("Unauthorized");
    }
    
    // Get user to update
    const userToUpdate = await ctx.db.get(id);
    if (!userToUpdate) {
      throw new Error("User not found");
    }
    
    // Check if current user is admin or the same user
    if (currentUser.role !== "admin" && currentUserId !== id) {
      throw new Error("Unauthorized");
    }
    
    // Check if users are in the same organization
    if (currentUser.organizationId !== userToUpdate.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Update fields
    const updates: Partial<{
      name: string;
      email: string;
    }> = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    
    await ctx.db.patch(id, updates);
    
    return { success: true };
  },
});

// Delete a staff member
export const deleteStaff = mutation({
  args: {
    id: v.id("staff"),
    currentUserId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const { id, currentUserId } = args;
    
    // Get current user
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized");
    }
    
    // Get user to delete
    const userToDelete = await ctx.db.get(id);
    if (!userToDelete) {
      throw new Error("User not found");
    }
    
    // Check if users are in the same organization
    if (currentUser.organizationId !== userToDelete.organizationId) {
      throw new Error("Unauthorized");
    }
    
    // Cannot delete yourself
    if (id === currentUserId) {
      throw new Error("Cannot delete yourself");
    }
    
    await ctx.db.delete(id);
    
    return { success: true };
  },
});

// Count staff members by organization
export const countByOrganization = query({
  args: { 
    organizationId: v.id("organizations")
  },
  handler: async (ctx, args) => {
    const { organizationId } = args;
    
    const staffMembers = await ctx.db
      .query("staff")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect();
    
    return staffMembers.length;
  },
}); 