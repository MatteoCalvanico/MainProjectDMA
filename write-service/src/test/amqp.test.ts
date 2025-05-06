import * as amqp from "amqplib";
import { mongoRepo } from "../repository/mongoRepo";
import { amqpService } from "../service/amqpService";

// Mock dependencies
jest.mock("amqplib");
jest.mock("../repository/mongoRepo");

describe("AMQP Service tests:", () => {
  let service: amqpService;
  let mockMongoRepo: jest.Mocked<mongoRepo>;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock Mongo
    mockMongoRepo = new mongoRepo() as jest.Mocked<mongoRepo>;
    mockMongoRepo.connect = jest.fn().mockResolvedValue(undefined);
    mockMongoRepo.saveSeries = jest.fn().mockResolvedValue(undefined);

    // Setup mock AMQP
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue({}),
      bindQueue: jest.fn().mockResolvedValue({}),
      consume: jest.fn().mockImplementation((queue, callback) => {
        mockChannel.consumeCallback = callback;
        return Promise.resolve({});
      }),
      ack: jest.fn(),
    };
    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    service = new amqpService();
    (service as any).mongo = mockMongoRepo;
  });

  describe("connect()", () => {
    test("should connect to MongoDB and RabbitMQ", async () => {
      await service.connect();

      expect(mockMongoRepo.connect).toHaveBeenCalled(); // Controlliamo connessione con Mongo

      // Controlliamo connessione con RabbitMQ
      const expectedUrl = "amqp://guest:guest@localhost:5672";
      expect(amqp.connect).toHaveBeenCalledWith(expectedUrl);
      expect(mockConnection.createChannel).toHaveBeenCalled();

      // Controlliamo queue setup
      expect(mockChannel.assertQueue).toHaveBeenCalledWith("projectOneData", {
        durable: true,
      });
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        "projectOneData",
        "amq.topic",
        "projectOneData"
      );
    });
  });

  describe("save()", () => {
    beforeEach(async () => {
      await service.connect();
    });

    test("should set up message consumer", () => {
      service.save();

      expect(mockChannel.consume).toHaveBeenCalledWith(
        "projectOneData",
        expect.any(Function)
      );
    });

    test("should process and save valid messages", async () => {
      service.save();

      // Simuliamo arrivo messaggi
      const mockMsg = {
        content: Buffer.from("user123|test message"),
      };

      // Chiamiamo la callback direttamente...
      await mockChannel.consumeCallback(mockMsg);

      // ...e controlliamo il messaggio sia salvato correttamente
      expect(mockMongoRepo.saveSeries).toHaveBeenCalledWith({
        topic: "projectOneData",
        payload: "user123|test message",
      });

      // Controlliamo l'ack
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    });

    test("should handle null messages gracefully", async () => {
      service.save();

      // Simuliamo l'arrivo di un null come msg
      await mockChannel.consumeCallback(null);
      expect(mockMongoRepo.saveSeries).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });
  });
});
