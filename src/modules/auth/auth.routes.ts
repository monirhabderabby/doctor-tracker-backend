import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authGuard } from "../../middlewares/auth";
import { loginSchema } from "./auth.schema";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, try again later",
  },
});

router.post(
  "/login",
  loginLimiter,
  validate({ body: loginSchema }),
  authController.login,
);
router.post("/logout", authController.logout);
router.get("/me", authGuard, authController.me);

export default router;
