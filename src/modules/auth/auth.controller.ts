import { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env";
import { authService } from "./auth.service";

const isProd = env.NODE_ENV === "production";

// frontend ar backend alada domain e hole production e sameSite "none" + secure lagbe
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { token, admin } = await authService.login(email, password);

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // JWT_EXPIRES_IN er sathe mil rakho
    });
    res.json({ success: true, data: admin });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("token", cookieOptions);
    res.json({ success: true, message: "Logged out" });
  },

  async me(_req: Request, res: Response) {
    const admin = await authService.getMe(res.locals.admin.id);
    res.json({ success: true, data: admin });
  },
};
