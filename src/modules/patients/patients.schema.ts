import { z } from "zod";
import { paginationSchema } from "../../utils/pagination";
import { emptyToUndefined, objectId } from "../../utils/validators";

// Accepts gender in any letter case, e.g. "male" becomes "MALE"
const genderSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.toUpperCase() : v),
  z.enum(["MALE", "FEMALE", "OTHER"]),
);

export const createPatientSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  age: z.coerce.number().int().min(0, "Invalid age").max(120, "Invalid age"),
  gender: genderSchema,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,15}$/, "Invalid phone number"),
  condition: z.string().trim().min(2, "Condition is required"),
});

// Shared list filters, reused by the dedicated patients list later
export const listPatientsQuerySchema = paginationSchema.extend({
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  condition: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  from: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  to: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  sort: z
    .enum(["newest", "oldest", "name_asc", "name_desc", "age_asc", "age_desc"])
    .default("newest"),
});

// Create from the patients page, so the doctor must be chosen in the body
export const createPatientWithDoctorSchema = createPatientSchema.extend({
  doctorId: objectId,
});

// Partial update, doctorId allowed for reassigning the patient
export const updatePatientSchema = createPatientSchema
  .partial()
  .extend({ doctorId: objectId.optional() })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

// Same filters as the nested list, plus an optional doctor filter
export const listAllPatientsQuerySchema = listPatientsQuerySchema.extend({
  doctorId: z.preprocess(emptyToUndefined, objectId.optional()),
});

export type CreatePatientWithDoctorInput = z.infer<
  typeof createPatientWithDoctorSchema
>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type ListAllPatientsQuery = z.infer<typeof listAllPatientsQuerySchema>;

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
