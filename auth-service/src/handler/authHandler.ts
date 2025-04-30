import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { controller } from "../controller/authController";

export class handler {
  private authController = new controller();

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      const { email, password } = loginSchema.parse(request.body);

      const userCredential = await this.authController.login(email, password);
      const user = userCredential.user;

      // Genera ID token (TODO: controllare per access token)
      const token = await user.getIdToken();

      reply.code(200).send({
        success: true,
        data: {
          token,
          uid: user.uid,
          email: user.email,
        },
      });
    } catch (error: any) {
      reply
        .code(
          error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
            ? 401
            : 500
        )
        .send({
          success: false,
          error: error.message,
        });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const registerSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      const { email, password } = registerSchema.parse(request.body);

      const userCredential = await this.authController.register(
        email,
        password
      );
      const user = userCredential.user;

      // Genera ID token (TODO: controllare per access token)
      const token = await user.getIdToken();

      reply.code(201).send({
        success: true,
        data: {
          token,
          uid: user.uid,
          email: user.email,
        },
      });
    } catch (error: any) {
      reply.code(error.code === "auth/email-already-in-use" ? 409 : 500).send({
        success: false,
        error: error.message,
      });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      await this.authController.logout();
      reply
        .code(200)
        .send({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  }
}
