/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as animals from "../animals.js";
import type * as behaviors from "../behaviors.js";
import type * as bodyExams from "../bodyExams.js";
import type * as email from "../email.js";
import type * as organizations from "../organizations.js";
import type * as species from "../species.js";
import type * as staff from "../staff.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  animals: typeof animals;
  behaviors: typeof behaviors;
  bodyExams: typeof bodyExams;
  email: typeof email;
  organizations: typeof organizations;
  species: typeof species;
  staff: typeof staff;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
