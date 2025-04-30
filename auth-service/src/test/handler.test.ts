import { handler } from "../handler/authHandler";
import { controller } from "../controller/authController";

// Mock controller
jest.mock("../controller/authController", () => ({
  controller: jest.fn().mockImplementation(() => ({
    register: jest.fn().mockResolvedValue({
      user: {
        uid: "test-uid-123",
        email: "test@example.com",
        getIdToken: jest.fn().mockResolvedValue("mocked-id-token"),
      },
      providerId: "password",
      operationType: "signIn",
    }),
    login: jest.fn().mockResolvedValue({
      user: {
        uid: "test-uid-123",
        email: "test@example.com",
        getIdToken: jest.fn().mockResolvedValue("mocked-id-token"),
      },
      providerId: "password",
      operationType: "signIn",
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe("AuthHandler tests:", () => {
  let authHandler: handler;
  let mockCtrl: any;

  // Mock Fastify request e reply
  const mockRequest = (body = {}) => ({
    body,
  });

  const mockReply = () => {
    const res: any = {};
    res.code = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authHandler = new handler();
    mockCtrl = (controller as jest.Mock).mock.results[0].value;
  });

  describe("login", () => {
    test("should return 200 with user data when login is successful", async () => {
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockReply();

      await authHandler.login(req as any, res as any);

      expect(mockCtrl.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        data: {
          token: "mocked-id-token",
          uid: "test-uid-123",
          email: "test@example.com",
        },
      });
    });

    test("should return 401 when credentials are invalid", async () => {
      mockCtrl.login.mockRejectedValueOnce({
        code: "auth/wrong-password",
        message: "Invalid credentials",
      });

      const req = mockRequest({
        email: "test@example.com",
        password: "wrongpassword",
      });
      const res = mockReply();

      await authHandler.login(req as any, res as any);

      expect(res.code).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Invalid credentials",
      });
    });

    test("should return 500 on unexpected error", async () => {
      mockCtrl.login.mockRejectedValueOnce({
        code: "auth/network-error",
        message: "Network error",
      });

      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockReply();

      await authHandler.login(req as any, res as any);

      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Network error",
      });
    });

    test("should validate email format", async () => {
      const req = mockRequest({
        email: "invalid-email",
        password: "password123",
      });
      const res = mockReply();

      await authHandler.login(req as any, res as any);

      expect(mockCtrl.login).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
      expect(res.send.mock.calls[0][0].success).toBe(false);
    });
  });

  describe("register", () => {
    test("should return 201 with user data when registration is successful", async () => {
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockReply();

      await authHandler.register(req as any, res as any);

      expect(mockCtrl.register).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(res.code).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        data: {
          token: "mocked-id-token",
          uid: "test-uid-123",
          email: "test@example.com",
        },
      });
    });

    test("should return 409 when email is already in use", async () => {
      mockCtrl.register.mockRejectedValueOnce({
        code: "auth/email-already-in-use",
        message: "Email already in use",
      });

      const req = mockRequest({
        email: "existing@example.com",
        password: "password123",
      });
      const res = mockReply();

      await authHandler.register(req as any, res as any);

      expect(res.code).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Email already in use",
      });
    });

    test("should return 500 on unexpected error", async () => {
      mockCtrl.register.mockRejectedValueOnce({
        code: "auth/network-error",
        message: "Network error",
      });

      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockReply();

      await authHandler.register(req as any, res as any);

      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Network error",
      });
    });

    test("should validate password length", async () => {
      const req = mockRequest({ email: "test@example.com", password: "123" });
      const res = mockReply();

      await authHandler.register(req as any, res as any);

      expect(mockCtrl.register).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
      expect(res.send.mock.calls[0][0].success).toBe(false);
    });
  });

  describe("logout", () => {
    test("should return 200 when logout is successful", async () => {
      const req = mockRequest();
      const res = mockReply();

      await authHandler.logout(req as any, res as any);

      expect(mockCtrl.logout).toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });

    test("should return 500 on error during logout", async () => {
      mockCtrl.logout.mockRejectedValueOnce(new Error("Logout failed"));

      const req = mockRequest();
      const res = mockReply();

      await authHandler.logout(req as any, res as any);

      expect(mockCtrl.logout).toHaveBeenCalled();
      expect(res.code).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Logout failed",
      });
    });
  });
});
