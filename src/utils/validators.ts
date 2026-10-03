import { z } from "zod";

// Validates a MongoDB ObjectId string
export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// Reusable schema for routes with an :id param
export const idParamSchema = z.object({ id: objectId });

// Turns empty query strings (e.g. ?search=) into undefined
export const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);
