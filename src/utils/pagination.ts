import { z } from "zod";

// Shared page/limit query schema, reused by every list endpoint
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Convert page/limit to a Prisma skip value
export const getSkip = (page: number, limit: number) => (page - 1) * limit;

// Standard pagination meta returned with every list response
export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
