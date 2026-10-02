import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";

const router = Router();

router.use("/auth", authRoutes);
// router.use("/doctors", authGuard, doctorRoutes);   // pore
// router.use("/patients", authGuard, patientRoutes);
// router.use("/dashboard", authGuard, dashboardRoutes);

export default router;
