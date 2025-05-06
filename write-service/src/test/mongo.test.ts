import mongoose from "mongoose";
import { mongoRepo } from "../repository/mongoRepo";
import { MessageSeries } from "../model/messageSchema";

// Mock mongoose e schema
jest.mock("mongoose");
jest.mock("../model/messageSchema", () => ({
  MessageSeries: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  })),
}));

describe("MongoRepository tests:", () => {
  let repository: mongoRepo;

  beforeAll(() => {
    (mongoose.connect as jest.Mock).mockResolvedValue({}); // Simuliamo che la connessione con MongoDB sia andata
    repository = new mongoRepo();
  });

  describe("saveSeries", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should correctly save series with parsed user data", async () => {
      // Arrange
      const topic = "projectOneData";
      const userId = "user123";
      const message = "test message";
      const payload = `${userId}|${message}`;

      const mockSaveMethod = jest.fn().mockResolvedValue({});
      (MessageSeries as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSaveMethod,
      }));

      // Act
      await repository.saveSeries({ topic, payload });

      // Assert
      expect(MessageSeries).toHaveBeenCalledWith({
        metadata: {
          topic: "projectOneData",
          payload: "test message",
          userId: "user123",
        },
      });

      expect(mockSaveMethod).toHaveBeenCalled();
    });

    test("should handle empty message part", async () => {
      // Arrange
      const topic = "projectOneData";
      const userId = "user123";
      const payload = `${userId}|`;

      const mockSaveMethod = jest.fn().mockResolvedValue({});
      (MessageSeries as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSaveMethod,
      }));

      // Act
      await repository.saveSeries({ topic, payload });

      // Assert
      expect(MessageSeries).toHaveBeenCalledWith({
        metadata: {
          topic: "projectOneData",
          payload: "",
          userId: "user123",
        },
      });

      expect(mockSaveMethod).toHaveBeenCalled();
    });

    test("should handle empty userId part", async () => {
      // Arrange
      const topic = "projectOneData";
      const message = "test message";
      const payload = `|${message}`;

      const mockSaveMethod = jest.fn().mockResolvedValue({});
      (MessageSeries as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSaveMethod,
      }));

      // Act
      await repository.saveSeries({ topic, payload });

      // Assert
      expect(MessageSeries).toHaveBeenCalledWith({
        metadata: {
          topic: "projectOneData",
          payload: "test message",
          userId: "",
        },
      });

      expect(mockSaveMethod).toHaveBeenCalled();
    });
  });
});
