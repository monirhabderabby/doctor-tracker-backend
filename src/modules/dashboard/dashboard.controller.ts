import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async summary(_req: Request, res: Response) {
    const data = await dashboardService.summary();
    res.json({ success: true, data });
  },

  async patientsPerDoctor(_req: Request, res: Response) {
    // Query was already validated and stored in res.locals by the validate middleware
    const data = await dashboardService.patientsPerDoctor(res.locals.query);
    res.json({ success: true, data });
  },

  async timeline(_req: Request, res: Response) {
    const data = await dashboardService.timeline(res.locals.query.range);
    res.json({ success: true, data });
  },

  async conditions(_req: Request, res: Response) {
    const data = await dashboardService.conditions();
    res.json({ success: true, data });
  },
};
