import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { controller } from "../controller/controller";
import { ParamType } from "../model/paramsType";

export class handler {
  private controller: controller;

  constructor(ctrl: controller) {
    this.controller = ctrl;
  }

  async save(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userSchema = z.object({
        registerDate: z
          .string()
          .datetime({
            message: "registerDate must be a valid ISO datetime format",
          })
          .optional(),
        userId: z.string({
          required_error: "userId is required",
          invalid_type_error: "userId must be a string",
        }),
        email: z
          .string({
            required_error: "email is required",
            invalid_type_error: "email must be a string",
          })
          .email({
            message: "Please provide a valid email address",
          }),
      });

      const userData = userSchema.parse(request.body);
      await this.controller.save({
        ...userData,
        registerDate: userData.registerDate || new Date().toISOString(), // Se non viene inserita nel body mettiamo la data e ora attuali
      });
      reply.code(200).send({ success: true });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  }

  async find(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { param } = request.query as { param?: string };

      if (!param) {
        // Nessun parametro passato, ritorna tutti gli utenti
        const users = await this.controller.find(null, ParamType.null);
        return reply.code(200).send({ success: true, users });
      }

      // Usiamo Zod per validare i diversi tipi di parametri
      const emailSchema = z.string().email();
      const dateSchema = z.string().datetime();
      const idSchema = z.string();

      // Proviamo a validare per ciascun parametro
      let paramType: ParamType;
      try {
        // Proviamo a validare come email
        emailSchema.parse(param);
        paramType = ParamType.Email;
      } catch {
        try {
          // Proviamo a validare come timestamp
          dateSchema.parse(param);
          paramType = ParamType.Stamp;
        } catch {
          try {
            // Proviamo a validare come userId
            idSchema.parse(param);
            paramType = ParamType.Id;
          } catch {
            // Nessuna validazione ha funzionato, il parametro passato è sbagliato
            return reply.code(400).send({
              success: false,
              error:
                "Invalid parameter format. Must be a valid email, ISO date, or ID",
            });
          }
        }
      }

      // Chiamiamo find con il paramType appropiato
      const users = await this.controller.find(param, paramType);
      reply.code(200).send({ success: true, users });
    } catch (error: any) {
      reply.code(500).send({ success: false, error: error.message });
    }
  }
}
