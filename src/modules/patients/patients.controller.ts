import { Request, Response } from "express";
import { patientsService } from "./patients.service";

export const patientsController = {
  async create(req: Request, res: Response) {
    const data = await patientsService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async list(_req: Request, res: Response) {
    // Query was already validated and stored in res.locals by the validate middleware
    const { data, meta } = await patientsService.list(res.locals.query);
    res.json({ success: true, data, meta });
  },

  async getById(req: Request, res: Response) {
    const data = await patientsService.getById(req.params.id as string);
    res.json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const data = await patientsService.update(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await patientsService.remove(req.params.id as string);
    res.json({ success: true, message: "Patient deleted" });
  },
};
