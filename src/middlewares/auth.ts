import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, "Authentication required");

  try {
    const payload = verifyToken(token);
    res.locals.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
};
