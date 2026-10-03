import { Request, Response } from "express";
import { doctorsService } from "./doctors.service";

export const doctorsController = {
  async create(req: Request, res: Response) {
    const data = await doctorsService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async list(_req: Request, res: Response) {
    // Query was already validated and stored in res.locals by the validate middleware
    const { data, meta } = await doctorsService.list(res.locals.query);
    res.json({ success: true, data, meta });
  },

  async getById(req: Request, res: Response) {
    const data = await doctorsService.getById(req.params.id as string);
    res.json({ success: true, data });
  },

  async update(req: Request, res: Response) {
    const data = await doctorsService.update(req.params.id as string, req.body);
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await doctorsService.remove(req.params.id as string);
    res.json({ success: true, message: "Doctor deleted" });
  },
};
