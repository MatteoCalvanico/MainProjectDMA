import { handler } from "../handlers/handler";
import { controller } from "../controller/controller";

// Mock zod with proper named export
jest.mock("zod", () => {
  // Create a z object with the methods we need
  const z = {
    string: () => ({
      datetime: () => ({
        parse: jest.fn((value) => {
          if (value === "invalid-timestamp") {
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
      }),
      parse: jest.fn((value) => {
        if (value === "") {
          const zodError = new Error();
          zodError.message = JSON.stringify([
            {
              code: "invalid_string",
              message: "Invalid userId format",
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
    findAllMessages: jest.fn(),
    findByStamp: jest.fn(),
    findByUser: jest.fn(),
  })),
}));

describe("Handler tests:", () => {
  let h: handler;
  let mockCtrl: jest.Mocked<controller>;

  // Create mock request and reply objects
  const mockRequest = (params = {}) => ({ params } as any);
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

  describe("findAll", () => {
    test("should call controller's findAllMessages and return results", async () => {
      const mockMessages = [
        { metadata: { topic: "test", payload: "data", userId: "user123" } },
      ];
      mockCtrl.findAllMessages.mockResolvedValue(mockMessages as any);

      const req = mockRequest();
      const res = mockReply();

      await h.findAll(req, res);

      expect(mockCtrl.findAllMessages).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ messages: mockMessages });
    });

    test("should handle errors properly", async () => {
      mockCtrl.findAllMessages.mockRejectedValue(new Error("Database error"));

      const req = mockRequest();
      const res = mockReply();

      await h.findAll(req, res);

      expect(mockCtrl.findAllMessages).toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database error",
      });
    });
  });

  describe("findStamp", () => {
    test("should call controller's findByStamp with timestamp parameter", async () => {
      const mockTimestamp = "2023-01-01T00:00:00Z";
      const mockMessages = [
        { timestamp: mockTimestamp, metadata: { userId: "user123" } },
      ];
      mockCtrl.findByStamp.mockResolvedValue(mockMessages as any);

      const req = mockRequest({ timestamp: mockTimestamp });
      const res = mockReply();

      await h.findStamp(req, res);

      expect(mockCtrl.findByStamp).toHaveBeenCalledWith(mockTimestamp);
      expect(res.send).toHaveBeenCalledWith({ message: mockMessages });
    });

    test("should handle validation errors", async () => {
      const req = mockRequest({ timestamp: "invalid-timestamp" });
      const res = mockReply();

      await h.findStamp(req, res);

      expect(mockCtrl.findByStamp).not.toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: JSON.stringify([
          {
            code: "invalid_string",
            validation: "datetime",
            message: "Invalid datetime",
            path: [],
          },
        ]),
      });
    });
  });

  describe("findUser", () => {
    test("should call controller's findByUser with userId parameter", async () => {
      const mockUserId = "user123";
      const mockMessages = [
        { metadata: { topic: "test", payload: "data", userId: mockUserId } },
      ];
      mockCtrl.findByUser.mockResolvedValue(mockMessages as any);

      const req = mockRequest({ userId: mockUserId });
      const res = mockReply();

      await h.findUser(req, res);

      expect(mockCtrl.findByUser).toHaveBeenCalledWith(mockUserId);
      expect(res.send).toHaveBeenCalledWith({ message: mockMessages });
    });

    test("should handle validation errors", async () => {
      const req = mockRequest({ userId: "" });
      const res = mockReply();

      await h.findUser(req, res);

      expect(mockCtrl.findByUser).not.toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: JSON.stringify([
          {
            code: "invalid_string",
            message: "Invalid userId format",
            path: [],
          },
        ]),
      });
    });
  });
});
