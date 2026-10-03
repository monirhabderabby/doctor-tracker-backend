import { Router } from "express";
import { patientsController } from "./patients.controller";
import { validate } from "../../middlewares/validate";
import { idParamSchema } from "../../utils/validators";
import {
  createPatientWithDoctorSchema,
  listAllPatientsQuerySchema,
  updatePatientSchema,
} from "./patients.schema";

const router = Router();

router.post(
  "/",
  validate({ body: createPatientWithDoctorSchema }),
  patientsController.create,
);
router.get(
  "/",
  validate({ query: listAllPatientsQuerySchema }),
  patientsController.list,
);
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  patientsController.getById,
);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updatePatientSchema }),
  patientsController.update,
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  patientsController.remove,
);

export default router;
