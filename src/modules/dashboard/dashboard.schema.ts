import { z } from "zod";

export const patientsPerDoctorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const timelineQuerySchema = z.object({
  range: z.enum(["7d", "30d", "12m"]).default("30d"),
});

export type PatientsPerDoctorQuery = z.infer<
  typeof patientsPerDoctorQuerySchema
>;
export type TimelineQuery = z.infer<typeof timelineQuerySchema>;
export type TimelineRange = TimelineQuery["range"];
