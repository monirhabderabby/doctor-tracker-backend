import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { validate } from "../../middlewares/validate";
import {
  patientsPerDoctorQuerySchema,
  timelineQuerySchema,
} from "./dashboard.schema";

const router = Router();

router.get("/summary", dashboardController.summary);
router.get(
  "/patients-per-doctor",
  validate({ query: patientsPerDoctorQuerySchema }),
  dashboardController.patientsPerDoctor,
);
router.get(
  "/timeline",
  validate({ query: timelineQuerySchema }),
  dashboardController.timeline,
);
router.get("/conditions", dashboardController.conditions);

export default router;
