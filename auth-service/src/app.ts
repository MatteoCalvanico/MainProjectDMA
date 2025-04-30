import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { handler } from "./handler/authHandler";
import { send } from "process";

export function buildApp() {
  const fastify = Fastify({
    logger: true,
  }) as FastifyInstance;

  const authHandler = new handler();

  fastify.get("/", (req: FastifyRequest, reply: FastifyReply) =>
    reply.code(200).send({ success: true, message: "Service work!" })
  );

  fastify.post("/logout", (req: FastifyRequest, reply: FastifyReply) =>
    authHandler.logout(req, reply)
  );

  fastify.post("/login", (req: FastifyRequest, reply: FastifyReply) =>
    authHandler.login(req, reply)
  );

  fastify.post("/register", (req: FastifyRequest, reply: FastifyReply) =>
    authHandler.register(req, reply)
  );

  return fastify;
}

const fastify = buildApp();
if (require.main === module) {
  fastify.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  });
}

export { fastify };
