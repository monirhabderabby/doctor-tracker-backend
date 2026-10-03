import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import { authGuard } from "./middlewares/auth";
import doctorRoutes from "./modules/doctors/doctors.routes";
import patientRoutes from "./modules/patients/patients.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);

// All doctor routes require a logged-in admin
router.use("/doctors", authGuard, doctorRoutes);

// All patient routes require a logged-in admin
router.use("/patients", authGuard, patientRoutes);

// All dashboard routes require a logged-in admin
router.use("/dashboard", authGuard, dashboardRoutes);

export default router;
