import { Router } from "express";
import { doctorsController } from "./doctors.controller";
import { validate } from "../../middlewares/validate";
import { idParamSchema } from "../../utils/validators";
import {
  createDoctorSchema,
  listDoctorsQuerySchema,
  updateDoctorSchema,
} from "./doctors.schema";
import doctorPatientsRoutes from "../doctor-patients/doctor-patients.routes";

const router = Router();

router.post(
  "/",
  validate({ body: createDoctorSchema }),
  doctorsController.create,
);
router.get(
  "/",
  validate({ query: listDoctorsQuerySchema }),
  doctorsController.list,
);
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  doctorsController.getById,
);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateDoctorSchema }),
  doctorsController.update,
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  doctorsController.remove,
);

// Nested patients routes: /api/doctors/:id/patients
router.use(
  "/:id/patients",
  validate({ params: idParamSchema }),
  doctorPatientsRoutes,
);

export default router;
