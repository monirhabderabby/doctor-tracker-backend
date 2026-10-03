import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildMeta, getSkip } from "../../utils/pagination";
import { assertDoctorExists } from "../doctors/doctors.utils";
import { buildPatientWhere, patientSortMap } from "./patients.query";
import type {
  CreatePatientWithDoctorInput,
  ListAllPatientsQuery,
  UpdatePatientInput,
} from "./patients.schema";

// Includes basic doctor info so the list page needs no extra request
const withDoctor = {
  doctor: {
    select: { id: true, name: true, specialization: true, hospital: true },
  },
} as const;

export const patientsService = {
  async create(input: CreatePatientWithDoctorInput) {
    // Explicit check so we never create a patient for a missing doctor
    await assertDoctorExists(input.doctorId);
    return prisma.patient.create({ data: input, include: withDoctor });
  },

  async list(query: ListAllPatientsQuery) {
    const { page, limit, sort, doctorId } = query;
    const where = {
      ...buildPatientWhere(query),
      // Optional filter by a single doctor
      ...(doctorId ? { doctorId } : {}),
    };

    // Run the page query and the total count in parallel
    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        // id as a tiebreaker keeps pagination order stable
        orderBy: [patientSortMap[sort], { id: "asc" }],
        skip: getSkip(page, limit),
        take: limit,
        include: withDoctor,
      }),
      prisma.patient.count({ where }),
    ]);

    return { data, meta: buildMeta(page, limit, total) };
  },

  async getById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: withDoctor,
    });
    if (!patient) throw new ApiError(404, "Patient not found");
    return patient;
  },

  async update(id: string, input: UpdatePatientInput) {
    // Validate the new doctor only when the patient is being reassigned
    if (input.doctorId) await assertDoctorExists(input.doctorId);
    // Missing id throws P2025, mapped to 404 by the error handler
    return prisma.patient.update({
      where: { id },
      data: input,
      include: withDoctor,
    });
  },

  async remove(id: string) {
    // Missing id throws P2025, mapped to 404 by the error handler
    await prisma.patient.delete({ where: { id } });
  },
};
