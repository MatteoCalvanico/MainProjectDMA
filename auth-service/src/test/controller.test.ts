import { controller } from "../controller/authController";
import { AuthService } from "../service/firebase";

// Mock the AuthService class
jest.mock("../service/firebase", () => {
  const mockAuthService = {
    loginWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: "test-uid-123",
        email: "test@example.com",
        getIdToken: jest.fn().mockResolvedValue("mocked-id-token"),
      },
      providerId: "password",
      operationType: "signIn",
    }),
    registerWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: "test-uid-123",
        email: "test@example.com",
        getIdToken: jest.fn().mockResolvedValue("mocked-id-token"),
      },
      providerId: "password",
      operationType: "signIn",
    }),
    logoutUser: jest.fn().mockResolvedValue(undefined),
    getAuth: jest.fn(),
  };

  return {
    AuthService: {
      getInstance: jest.fn().mockReturnValue(mockAuthService),
    },
  };
});

describe("Controller tests:", () => {
  let ctrl: controller;
  let mockAuthService: any;

  beforeAll(() => {
    ctrl = new controller();
    mockAuthService = AuthService.getInstance();
  });

  describe("register", () => {
    test("should return a Promise with user's data", async () => {
      const result = await ctrl.register("test@example.com", "psw");

      expect(mockAuthService.registerWithEmailAndPassword).toHaveBeenCalledWith(
        "test@example.com",
        "psw"
      );
      expect(result.user).toHaveProperty("uid", "test-uid-123");
      expect(result.user).toHaveProperty("email", "test@example.com");
    });
  });

  describe("login", () => {
    test("should return a Promise with user's data", async () => {
      const result = await ctrl.login("test@example.com", "psw");

      expect(mockAuthService.loginWithEmailAndPassword).toHaveBeenCalledWith(
        "test@example.com",
        "psw"
      );
      expect(result.user).toHaveProperty("uid", "test-uid-123");
      expect(result.user).toHaveProperty("email", "test@example.com");
    });
  });

  describe("logout", () => {
    test("should return an empty Promise", async () => {
      const result = await ctrl.logout();

      expect(mockAuthService.logoutUser).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
