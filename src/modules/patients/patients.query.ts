import { Prisma } from "@prisma/client";
import { endOfDay } from "../../utils/date";
import type { ListPatientsQuery } from "./patients.schema";

// Maps the sort query value to a Prisma orderBy clause
export const patientSortMap: Record<
  ListPatientsQuery["sort"],
  Prisma.PatientOrderByWithRelationInput
> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  age_asc: { age: "asc" },
  age_desc: { age: "desc" },
};

// Builds the shared where clause for search, condition and date range filters
export const buildPatientWhere = (
  query: ListPatientsQuery,
): Prisma.PatientWhereInput => {
  const { search, condition, from, to } = query;

  return {
    // Free-text search across name, phone and condition
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { condition: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    // Exact (case-insensitive) condition filter
    ...(condition
      ? { condition: { equals: condition, mode: "insensitive" } }
      : {}),
    // Created-date range filter
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: endOfDay(to) } : {}),
          },
        }
      : {}),
  };
};
