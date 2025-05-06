import mongoose from "mongoose";
import { mongoRepo } from "../repository/mongoRepo";
import { User } from "../model/userSchema";

// Mock mongoose e schema
jest.mock("mongoose");
jest.mock("../model/userSchema", () => ({
  User: {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockResolvedValue({}),
  },
}));

describe("MongoRepository tests:", () => {
  let repository: mongoRepo;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    (mongoose.connect as jest.Mock).mockResolvedValue({}); // Simuliamo che la connessione con MongoDB sia andata
    repository = new mongoRepo();
  });

  describe("connect", () => {
    test("should connect to MongoDB", async () => {
      await repository.connect();
      expect(mongoose.connect).toHaveBeenCalledWith(
        expect.stringContaining("mongodb://")
      );
    });
  });

  describe("find methods", () => {
    const mockUsers = [
      {
        userId: "test-user-123",
        email: "test@example.com",
        registerDate: "2023-01-01T00:00:00Z",
      },
    ];

    beforeEach(() => {
      (User.find as jest.Mock).mockResolvedValue(mockUsers);
    });

    test("should find all users", async () => {
      const result = await repository.findAll();

      expect(User.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockUsers);
    });

    test("should find users by registerDate", async () => {
      const date = "2023-01-01T00:00:00Z";
      const result = await repository.findByRegisterDate(date);

      expect(User.find).toHaveBeenCalledWith({ registerDate: date });
      expect(result).toEqual(mockUsers);
    });

    test("should find users by userId", async () => {
      const userId = "test-user-123";
      const result = await repository.findByUserId(userId);

      expect(User.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockUsers);
    });

    test("should find users by email", async () => {
      const email = "test@example.com";
      const result = await repository.findByEmail(email);

      expect(User.find).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUsers);
    });
  });
});
