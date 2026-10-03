import { Router } from "express";
import { doctorsController } from "./doctors.controller";
import { validate } from "../../middlewares/validate";
import { idParamSchema } from "../../utils/validators";
import {
  createDoctorSchema,
  listDoctorsQuerySchema,
  updateDoctorSchema,
} from "./doctors.schema";

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

export default router;
