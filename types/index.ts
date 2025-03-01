import { Id } from "@/convex/_generated/dataModel";

// User types
export type UserRole = "admin" | "user";

export interface User {
  id: Id<"staff">;
  name: string;
  email: string;
  role: UserRole;
  organizationId: Id<"organizations">;
}

export interface Organization {
  id: Id<"organizations">;
  name: string;
  address: string;
  email: string;
  inviteCode: string;
  createdAt: number;
}

export interface Species {
  id: Id<"species">;
  name: string;
  description?: string;
  organizationId: Id<"organizations">;
  createdAt: number;
  createdBy: Id<"staff">;
}

export type AnimalStatus = "active" | "released" | "deceased";
export type AnimalGender = "male" | "female" | "unknown";

export interface Animal {
  id: Id<"animals">;
  name: string;
  speciesId: Id<"species">;
  organizationId: Id<"organizations">;
  dateOfBirth?: number;
  gender?: AnimalGender;
  identificationNumber?: string;
  status: AnimalStatus;
  createdAt: number;
  createdBy: Id<"staff">;
}

export interface Behavior {
  id: Id<"behaviors">;
  animalId: Id<"animals">;
  behavior: string;
  description?: string;
  location?: string;
  organizationId: Id<"organizations">;
  staffId: Id<"staff">;
  createdAt: number;
}

export interface BodyExam {
  id: Id<"bodyExams">;
  animalId: Id<"animals">;
  weight?: number;
  diagnosis?: string;
  notes?: string;
  organizationId: Id<"organizations">;
  staffId: Id<"staff">;
  createdAt: number;
}

// Form types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface AdminSignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin";
  organizationName: string;
  organizationAddress: string;
}

export interface UserSignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user";
  inviteCode: string;
}

export type SignupFormValues = AdminSignupFormValues | UserSignupFormValues;

export interface SpeciesFormValues {
  name: string;
  description?: string;
}

export interface AnimalFormValues {
  name: string;
  speciesId: Id<"species">;
  dateOfBirth?: Date;
  gender?: AnimalGender;
  identificationNumber?: string;
  status: AnimalStatus;
}

export interface BehaviorFormValues {
  animalId: Id<"animals">;
  behavior: string;
  description?: string;
  location?: string;
}

export interface BodyExamFormValues {
  animalId: Id<"animals">;
  weight?: number;
  diagnosis?: string;
  notes?: string;
}

// Filter types
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchFilter {
  searchTerm?: string;
}

export interface PaginationState {
  limit: number;
  cursor?: string;
}

export interface FilterState extends DateRangeFilter, SearchFilter {
  animalId?: Id<"animals">;
  speciesId?: Id<"species">;
}

// Next Auth types
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId: string;
  }

  interface Session {
    user: User;
  }
}

export interface CommonBehavior {
  id: Id<"commonBehaviors">;
  name: string;
  description?: string;
  speciesId: Id<"species">;
  createdAt: number;
  createdBy: Id<"staff">;
} 