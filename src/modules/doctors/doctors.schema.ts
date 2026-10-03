import { z } from "zod";
import { paginationSchema } from "../../utils/pagination";
import { emptyToUndefined } from "../../utils/validators";

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  specialization: z.string().trim().min(2, "Specialization is required"),
  hospital: z.string().trim().min(2, "Hospital is required"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,15}$/, "Invalid phone number"),
  email: z.string().trim().toLowerCase().email("Invalid email"),
});

// Partial update, but at least one field must be sent
export const updateDoctorSchema = createDoctorSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const listDoctorsQuerySchema = paginationSchema.extend({
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  specialization: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  hospital: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  from: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  to: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;
