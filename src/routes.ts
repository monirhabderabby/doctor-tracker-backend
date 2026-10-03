import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import { authGuard } from "./middlewares/auth";
import doctorRoutes from "./modules/doctors/doctors.routes";
import patientRoutes from "./modules/patients/patients.routes";

const router = Router();

router.use("/auth", authRoutes);

// All doctor routes require a logged-in admin
router.use("/doctors", authGuard, doctorRoutes);

// All patient routes require a logged-in admin
router.use("/patients", authGuard, patientRoutes);
// router.use("/dashboard", authGuard, dashboardRoutes);

export default router;
