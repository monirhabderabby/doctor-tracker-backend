import { Request, Response } from "express";
import { doctorPatientsService } from "./doctor-patients.service";

export const doctorPatientsController = {
  async list(req: Request, res: Response) {
    // Query was already validated and stored in res.locals by the validate middleware
    const { data, meta } = await doctorPatientsService.list(
      req.params.id as string,
      res.locals.query,
    );
    res.json({ success: true, data, meta });
  },

  async create(req: Request, res: Response) {
    const data = await doctorPatientsService.create(
      req.params.id as string,
      req.body,
    );
    res.status(201).json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    await doctorPatientsService.remove(
      req.params.id as string,
      req.params.patientId as string,
    );
    res.json({ success: true, message: "Patient deleted" });
  },
};
