import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildMeta, getSkip } from "../../utils/pagination";
import type {
  CreateDoctorInput,
  ListDoctorsQuery,
  UpdateDoctorInput,
} from "./doctors.schema";

// Maps the sort query value to a Prisma orderBy clause
const sortMap: Record<
  ListDoctorsQuery["sort"],
  Prisma.DoctorOrderByWithRelationInput
> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
};

// Includes the patient count so the list page needs no extra request
const withPatientCount = { _count: { select: { patients: true } } } as const;

// Flattens Prisma's _count into a patientCount field
const toResponse = <T extends { _count: { patients: number } }>({
  _count,
  ...doctor
}: T) => ({
  ...doctor,
  patientCount: _count.patients,
});

// Makes a date-only "to" filter include the whole day
const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

export const doctorsService = {
  async create(input: CreateDoctorInput) {
    // Duplicate email throws P2002, mapped to 409 by the error handler
    const doctor = await prisma.doctor.create({
      data: input,
      include: withPatientCount,
    });
    return toResponse(doctor);
  },

  async list(query: ListDoctorsQuery) {
    const { page, limit, search, specialization, hospital, from, to, sort } =
      query;

    const where: Prisma.DoctorWhereInput = {
      // Free-text search across the main text fields
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { specialization: { contains: search, mode: "insensitive" } },
              { hospital: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      // Exact (case-insensitive) dropdown filters
      ...(specialization
        ? { specialization: { equals: specialization, mode: "insensitive" } }
        : {}),
      ...(hospital
        ? { hospital: { equals: hospital, mode: "insensitive" } }
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

    // Run the page query and the total count in parallel
    const [items, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        // id as a tiebreaker keeps pagination order stable
        orderBy: [sortMap[sort], { id: "asc" }],
        skip: getSkip(page, limit),
        take: limit,
        include: withPatientCount,
      }),
      prisma.doctor.count({ where }),
    ]);

    return { data: items.map(toResponse), meta: buildMeta(page, limit, total) };
  },

  async getById(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: withPatientCount,
    });
    if (!doctor) throw new ApiError(404, "Doctor not found");
    return toResponse(doctor);
  },

  async update(id: string, input: UpdateDoctorInput) {
    // Missing id throws P2025 (404), duplicate email throws P2002 (409)
    const doctor = await prisma.doctor.update({
      where: { id },
      data: input,
      include: withPatientCount,
    });
    return toResponse(doctor);
  },

  async remove(id: string) {
    // Patients are deleted too because of onDelete: Cascade in the schema
    await prisma.doctor.delete({ where: { id } });
  },
};
