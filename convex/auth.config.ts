import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

// Define types for our token
type AuthToken = {
  sub: string;
  userId: Id<"staff">;
  organizationId: Id<"organizations">;
  role: string;
};

// Define types for the context
type AuthContext = {
  auth: any;
};

// Define the auth config
const authConfig = {
  providers: [],
  // This function determines what fields are available on ctx.auth
  getUserIdentity: async (ctx: AuthContext, token: AuthToken | null) => {
    // Return null if there's no token
    if (!token) return null;
    
    return {
      // Required field from Convex Auth
      tokenIdentifier: token.sub,
      // Custom fields we want available on ctx.auth
      userId: token.userId,
      organizationId: token.organizationId, 
      role: token.role
    };
  }
} as const;

export default authConfig;
