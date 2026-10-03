import { Router } from "express";
import { doctorPatientsController } from "./doctor-patients.controller";
import { validate } from "../../middlewares/validate";
import {
  createPatientSchema,
  listPatientsQuerySchema,
} from "../patients/patients.schema";
import { doctorPatientParamsSchema } from "./doctor-patients.schema";

// mergeParams exposes the parent :id (doctor id) inside this router
const router = Router({ mergeParams: true });

router.get(
  "/",
  validate({ query: listPatientsQuerySchema }),
  doctorPatientsController.list,
);
router.post(
  "/",
  validate({ body: createPatientSchema }),
  doctorPatientsController.create,
);
router.delete(
  "/:patientId",
  validate({ params: doctorPatientParamsSchema }),
  doctorPatientsController.remove,
);

export default router;
