import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { signToken } from "../../utils/jwt";

export const authService = {
  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    const valid = admin && (await bcrypt.compare(password, admin.password));

    // email ba password kon ta vul seta bole dibo na
    if (!admin || !valid) throw new ApiError(401, "Invalid email or password");

    const token = signToken({ sub: admin.id, email: admin.email });
    return {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    };
  },

  async getMe(id: string) {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
    if (!admin) throw new ApiError(401, "Unauthorized");
    return admin;
  },
};
