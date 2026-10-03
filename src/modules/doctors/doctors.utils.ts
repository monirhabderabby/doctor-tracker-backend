import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

// Throws 404 if the doctor does not exist
export const assertDoctorExists = async (doctorId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });
  if (!doctor) throw new ApiError(404, "Doctor not found");
};
