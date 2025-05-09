import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { controller } from "../controller/authController";
import { AdminService } from "../service/firebase-admin";

export class handler {
  private authController = new controller();
  private firebaseAdmin = AdminService.getInstance();

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });

      const { email, password } = loginSchema.parse(request.body);

      const userCredential = await this.authController.login(email, password);
      const user = userCredential.user;

      // Genera ID token e Access token
      const IDtoken = await user.getIdToken();
      const refreshToken = user.refreshToken;
      const accessToken = await this.firebaseAdmin.createAccessToken(user.uid);

      reply.code(200).send({
        success: true,
        data: {
          IDtoken,
          accessToken,
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
      const userId = user.uid;

      // Genera ID token e Access token
      const IDtoken = await user.getIdToken();
      const accessToken = await this.firebaseAdmin.createAccessToken(userId);

      reply.code(200).send({
        success: true,
        data: {
          IDtoken,
          accessToken,
          uid: user.uid,
          email: user.email,
        },
      });

      // Aggiunta info in MongoDB
      await fetch(`http://user:8100/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userId }),
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
