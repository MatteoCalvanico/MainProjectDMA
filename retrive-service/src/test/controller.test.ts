import { controller } from "../controller/controller";
import { mongoRepo } from "../repository/mongoRepo";

// Mock mongoRepo
jest.mock("../repository/mongoRepo", () => {
  return {
    mongoRepo: jest.fn().mockImplementation(() => ({
      findSeries: jest.fn(),
      findSeriesByTimestamp: jest.fn(),
      findSeriesByUserId: jest.fn(),
    })),
  };
});

describe("Controller tests:", () => {
  let ctrl: controller;
  let mockMongoRepo: jest.Mocked<mongoRepo>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMongoRepo = new mongoRepo() as jest.Mocked<mongoRepo>;
    ctrl = new controller(mockMongoRepo);
  });

  describe("findAllMessages", () => {
    test("should call repo's findSeries method", async () => {
      const mockMessages = [
        { metadata: { topic: "test", payload: "data", userId: "user123" } },
      ];
      mockMongoRepo.findSeries.mockResolvedValue(mockMessages as any);

      const result = await ctrl.findAllMessages();

      expect(mockMongoRepo.findSeries).toHaveBeenCalled();
      expect(result).toEqual(mockMessages);
    });
  });

  describe("findByStamp", () => {
    test("should call repo's findSeriesByTimestamp method with the timestamp", async () => {
      const mockTimestamp = "2023-01-01T00:00:00Z";
      const mockMessages = [
        { timestamp: mockTimestamp, metadata: { userId: "user123" } },
      ];
      mockMongoRepo.findSeriesByTimestamp.mockResolvedValue(
        mockMessages as any
      );

      const result = await ctrl.findByStamp(mockTimestamp);

      expect(mockMongoRepo.findSeriesByTimestamp).toHaveBeenCalledWith(
        mockTimestamp
      );
      expect(result).toEqual(mockMessages);
    });
  });

  describe("findByUser", () => {
    test("should call repo's findSeriesByUserId method with the userId", async () => {
      const mockUserId = "user123";
      const mockMessages = [
        { metadata: { topic: "test", payload: "data", userId: mockUserId } },
      ];
      mockMongoRepo.findSeriesByUserId.mockResolvedValue(mockMessages as any);

      const result = await ctrl.findByUser(mockUserId);

      expect(mockMongoRepo.findSeriesByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockMessages);
    });
  });
});
