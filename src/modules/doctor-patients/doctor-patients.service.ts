import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildMeta, getSkip } from "../../utils/pagination";
import { buildPatientWhere, patientSortMap } from "../patients/patients.query";
import type {
  CreatePatientInput,
  ListPatientsQuery,
} from "../patients/patients.schema";

import { assertDoctorExists } from "../doctors/doctors.utils";

export const doctorPatientsService = {
  async list(doctorId: string, query: ListPatientsQuery) {
    await assertDoctorExists(doctorId);

    const { page, limit, sort } = query;
    // Scope every query to this doctor on top of the shared filters
    const where = { doctorId, ...buildPatientWhere(query) };

    // Run the page query and the total count in parallel
    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        // id as a tiebreaker keeps pagination order stable
        orderBy: [patientSortMap[sort], { id: "asc" }],
        skip: getSkip(page, limit),
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return { data, meta: buildMeta(page, limit, total) };
  },

  async create(doctorId: string, input: CreatePatientInput) {
    // Explicit check so we never create a patient for a missing doctor
    await assertDoctorExists(doctorId);
    return prisma.patient.create({ data: { ...input, doctorId } });
  },

  async remove(doctorId: string, patientId: string) {
    // Matching on doctorId too makes sure the patient belongs to this doctor
    const { count } = await prisma.patient.deleteMany({
      where: { id: patientId, doctorId },
    });
    if (count === 0)
      throw new ApiError(404, "Patient not found for this doctor");
  },
};
