import { z } from "zod";
import { objectId } from "../../utils/validators";

// Params for routes that target one patient under a doctor
export const doctorPatientParamsSchema = z.object({
  id: objectId,
  patientId: objectId,
});
