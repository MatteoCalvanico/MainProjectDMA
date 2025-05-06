import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { mongoRepo } from "./repository/mongoRepo";
import { handler } from "./handlers/handler";
import { controller } from "./controller/controller";

// Funzione che crea e configura l'app
export function buildApp() {
  const fastify = Fastify({
    logger: true,
  }) as FastifyInstance;
  const db = new mongoRepo();

  // Inizializzazione DB
  initializeDatabase(db);

  // Inizializzazione controller
  const h = new handler(new controller(db));

  fastify.get("/retrive/verify", (req: FastifyRequest, reply: FastifyReply) =>
    reply.code(200).send({ success: true, message: "Service work!" })
  );

  // Rotta per prendere tutti i messaggi
  fastify.get("/", (req: FastifyRequest, reply: FastifyReply) =>
    h.findAll(req, reply)
  );

  // Rotta per cercare messaggi per timestamp
  fastify.get("/stamp/:timestamp", (req: FastifyRequest, reply: FastifyReply) =>
    h.findStamp(req, reply)
  );

  // Rotta per cercare messaggi per userId
  fastify.get("/user/:userId", (req: FastifyRequest, reply: FastifyReply) =>
    h.findUser(req, reply)
  );

  return fastify;
}

// Inizializza connessione DB
async function initializeDatabase(mongoRepository: mongoRepo) {
  try {
    await mongoRepository.connect();
    fastify.log.info("Connect to MongoDB");
  } catch (error: any) {
    fastify.log.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Crea l'app
const fastify = buildApp();

// Avvia il server solo app.ts viene eseguito direttamente
if (require.main === module) {
  fastify.listen({ port: 8090, host: "0.0.0.0" }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  });
}

export { fastify };
