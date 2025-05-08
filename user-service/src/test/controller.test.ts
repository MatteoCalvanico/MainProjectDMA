import { controller } from "../controller/controller";
import { mongoRepo } from "../repository/mongoRepo";
import { ParamType } from "../model/paramsType";

// Mock mongoRepo
jest.mock("../repository/mongoRepo", () => {
  return {
    mongoRepo: jest.fn().mockImplementation(() => ({
      save: jest.fn(),
      findAll: jest.fn(),
      findByRegisterDate: jest.fn(),
      findByUserId: jest.fn(),
      findByEmail: jest.fn(),
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

  describe("save", () => {
    test("should call repo's save method with correct parameters", async () => {
      const mockData = {
        registerDate: "2023-01-01T00:00:00Z",
        userId: "user123",
        email: "test@example.com",
      };
      mockMongoRepo.save.mockResolvedValue({
        success: true,
        message: "User created successfully",
      });

      const result = await ctrl.save(mockData);

      expect(mockMongoRepo.save).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({
        success: true,
        message: "User created successfully",
      });
    });
  });

  describe("find", () => {
    const mockUsers = [
      {
        userId: "user123",
        email: "test@example.com",
        registerDate: "2023-01-01T00:00:00Z",
      },
    ];

    test("should call repo's findAll method when param is null", async () => {
      mockMongoRepo.findAll.mockResolvedValue(mockUsers as any);

      const result = await ctrl.find(null, ParamType.null);

      expect(mockMongoRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    test("should call repo's findByUserId method with userId when type is Id", async () => {
      const userId = "user123";
      mockMongoRepo.findByUserId.mockResolvedValue(mockUsers as any);

      const result = await ctrl.find(userId, ParamType.Id);

      expect(mockMongoRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUsers);
    });

    test("should call repo's findByEmail method with email when type is Email", async () => {
      const email = "test@example.com";
      mockMongoRepo.findByEmail.mockResolvedValue(mockUsers as any);

      const result = await ctrl.find(email, ParamType.Email);

      expect(mockMongoRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUsers);
    });

    test("should call repo's findByRegisterDate method with date when type is Stamp", async () => {
      const date = "2023-01-01T00:00:00Z";
      mockMongoRepo.findByRegisterDate.mockResolvedValue(mockUsers as any);

      const result = await ctrl.find(date, ParamType.Stamp);

      expect(mockMongoRepo.findByRegisterDate).toHaveBeenCalledWith(date);
      expect(result).toEqual(mockUsers);
    });
  });
});
