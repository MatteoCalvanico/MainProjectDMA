import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { handler } from "./handler/authHandler";

export function buildApp() {
  const fastify = Fastify({
    logger: true,
  }) as FastifyInstance;

  const authHandler = new handler();

  fastify.post("/api/auth/logout", (req: FastifyRequest, reply: FastifyReply) =>
    authHandler.logout(req, reply)
  );

  fastify.post("/api/auth/login", (req: FastifyRequest, reply: FastifyReply) =>
    authHandler.login(req, reply)
  );

  fastify.post(
    "/api/auth/register",
    (req: FastifyRequest, reply: FastifyReply) =>
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
