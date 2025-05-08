import { handler } from "../handlers/handler";
import { controller } from "../controller/controller";
import { ParamType } from "../model/paramsType";

// Mock zod with proper named export
jest.mock("zod", () => {
  // Create a z object with the methods we need
  const z = {
    object: () => ({
      parse: jest.fn((value) => {
        // Basic validation for testing
        if (value.email && !value.email.includes("@")) {
          const zodError = new Error();
          zodError.message = JSON.stringify([
            {
              code: "invalid_string",
              message: "Please provide a valid email address",
              path: ["email"],
            },
          ]);
          throw zodError;
        }

        if (value.userId === "") {
          const zodError = new Error();
          zodError.message = JSON.stringify([
            {
              code: "invalid_string",
              message: "userId is required",
              path: ["userId"],
            },
          ]);
          throw zodError;
        }

        return value;
      }),
    }),
    string: () => ({
      email: () => ({
        parse: jest.fn((value) => {
          if (!value.includes("@")) {
            const zodError = new Error();
            zodError.message = JSON.stringify([
              {
                code: "invalid_string",
                message: "Invalid email format",
                path: [],
              },
            ]);
            throw zodError;
          }
          return value;
        }),
      }),
      datetime: () => ({
        parse: jest.fn((value) => {
          // Only accept proper ISO datetime strings
          if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
            const zodError = new Error();
            zodError.message = JSON.stringify([
              {
                code: "invalid_string",
                validation: "datetime",
                message: "Invalid datetime",
                path: [],
              },
            ]);
            throw zodError;
          }
          return value;
        }),
        optional: () => ({
          parse: jest.fn((value) => value),
        }),
      }),
      parse: jest.fn((value) => {
        if (value === "invalid-param") {
          const zodError = new Error();
          zodError.message = JSON.stringify([
            {
              code: "invalid_string",
              message: "Invalid string format",
              path: [],
            },
          ]);
          throw zodError;
        }
        return value;
      }),
    }),
  };

  // Export z as both the default and named export
  return {
    __esModule: true,
    default: z,
    z: z,
  };
});

// Mock controller
jest.mock("../controller/controller", () => ({
  controller: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    find: jest.fn(),
  })),
}));

describe("Handler tests:", () => {
  let h: handler;
  let mockCtrl: jest.Mocked<controller>;

  // Create mock request and reply objects
  const mockRequest = (body = {}, query = {}, params = {}) =>
    ({
      body,
      query,
      params,
    } as any);

  const mockReply = () => {
    const res: any = {};
    res.code = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtrl = new controller({} as any) as jest.Mocked<controller>;
    h = new handler(mockCtrl);
  });

  describe("save", () => {
    // Save tests remain unchanged
    test("should call controller's save with user data and return success response", async () => {
      const userData = {
        userId: "user123",
        email: "test@example.com",
        registerDate: "2023-01-01T00:00:00Z",
      };

      mockCtrl.save.mockResolvedValue({
        success: true,
        message: "User created successfully",
      });

      const req = mockRequest(userData);
      const res = mockReply();

      await h.save(req, res);

      expect(mockCtrl.save).toHaveBeenCalledWith({
        ...userData,
        registerDate: userData.registerDate,
      });
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "User created successfully",
      });
    });

    test("should handle validation errors", async () => {
      const userData = {
        userId: "user123",
        email: "invalid-email", // Invalid email format
      };

      const req = mockRequest(userData);
      const res = mockReply();

      await h.save(req, res);

      expect(mockCtrl.save).not.toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
      });
    });

    test("should handle existing user error", async () => {
      const userData = {
        userId: "existing-user",
        email: "test@example.com",
        registerDate: "2023-01-01T00:00:00Z",
      };

      mockCtrl.save.mockResolvedValue({
        success: false,
        message: "User with this userId already exists",
      });

      const req = mockRequest(userData);
      const res = mockReply();

      await h.save(req, res);

      expect(mockCtrl.save).toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "User with this userId already exists",
      });
    });

    test("should set default registerDate if not provided", async () => {
      const userData = {
        userId: "user123",
        email: "test@example.com",
        // No registerDate provided
      };

      mockCtrl.save.mockResolvedValue({
        success: true,
        message: "User created successfully",
      });

      const req = mockRequest(userData);
      const res = mockReply();

      await h.save(req, res);

      expect(mockCtrl.save).toHaveBeenCalledWith({
        ...userData,
        registerDate: expect.any(String), // ISO date string
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

    test("should return all users when no param is provided", async () => {
      mockCtrl.find.mockResolvedValue(mockUsers as any);

      const req = mockRequest({}, { param: undefined });
      const res = mockReply();

      await h.find(req, res);

      expect(mockCtrl.find).toHaveBeenCalledWith(null, ParamType.null);
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        users: mockUsers,
      });
    });

    test("should call controller's find with email parameter when email is provided", async () => {
      const email = "test@example.com";
      mockCtrl.find.mockResolvedValue(mockUsers as any);

      const req = mockRequest({}, { param: email });
      const res = mockReply();

      await h.find(req, res);

      expect(mockCtrl.find).toHaveBeenCalledWith(email, ParamType.Email);
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        users: mockUsers,
      });
    });

    test("should call controller's find with userId parameter when userId is provided", async () => {
      const userId = "user123";
      mockCtrl.find.mockResolvedValue(mockUsers as any);

      const req = mockRequest({}, { param: userId });
      const res = mockReply();

      await h.find(req, res);

      expect(mockCtrl.find).toHaveBeenCalledWith(userId, ParamType.Id);
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        users: mockUsers,
      });
    });

    test("should call controller's find with date parameter when timestamp is provided", async () => {
      const date = "2023-01-01T00:00:00Z";
      mockCtrl.find.mockResolvedValue(mockUsers as any);

      const req = mockRequest({}, { param: date });
      const res = mockReply();

      await h.find(req, res);

      expect(mockCtrl.find).toHaveBeenCalledWith(date, ParamType.Stamp);
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        users: mockUsers,
      });
    });

    test("should handle invalid parameter format", async () => {
      const req = mockRequest({}, { param: "invalid-param" });
      const res = mockReply();

      await h.find(req, res);

      expect(res.code).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining("Invalid parameter format"),
      });
    });

    test("should handle server errors", async () => {
      mockCtrl.find.mockRejectedValue(new Error("Database error"));

      const req = mockRequest({}, { param: "test@example.com" });
      const res = mockReply();

      await h.find(req, res);

      expect(mockCtrl.find).toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database error",
      });
    });
  });
});
