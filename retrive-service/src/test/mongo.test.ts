import mongoose from "mongoose";
import { mongoRepo } from "../repository/mongoRepo";
import { MessageSeries } from "../model/messageSchema";

// Mock mongoose e schema
jest.mock("mongoose");
jest.mock("../model/messageSchema", () => ({
  MessageSeries: {
    find: jest.fn(),
    save: jest.fn(),
  },
}));

describe("MongoRepository tests:", () => {
  let repository: mongoRepo;

  beforeAll(() => {
    (mongoose.connect as jest.Mock).mockResolvedValue({}); // Simuliamo che la connessione con MongoDB sia andata
    repository = new mongoRepo();
  });

  describe("MessageSeries:", () => {
    test("should find all message series when no parameters are provided", async () => {
      const mockSeries = [{ metadata: { topic: "test", payload: "data" } }];
      (MessageSeries.find as jest.Mock).mockResolvedValue(mockSeries); // Facciamo ritornare dal .find i nosti dati finti

      const result = await repository.findSeries();

      expect(MessageSeries.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockSeries);
    });

    test("should find messages by timestamp", async () => {
      const mockMessages = [{ timestamp: "2023-01-01T00:00:00Z" }];
      (MessageSeries.find as jest.Mock).mockResolvedValue(mockMessages); // Facciamo ritornare dal .find i nosti dati finti

      const result = await repository.findSeriesByTimestamp(
        "2023-01-01T00:00:00Z"
      );

      expect(MessageSeries.find).toHaveBeenCalledWith({
        timestamp: "2023-01-01T00:00:00Z",
      });
      expect(result).toEqual(mockMessages);
    });
  });
});
