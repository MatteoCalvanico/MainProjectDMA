import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

import { auth } from "./service/firebase";

export function buildApp() {
  const fastify = Fastify({
    logger: true,
  }) as FastifyInstance;

  // TODO: setup handler and controller

  fastify.get("/", (req: FastifyRequest, reply: FastifyReply) => null); // TODO: put handler method

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
