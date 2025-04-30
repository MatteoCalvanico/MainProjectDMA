import { controller } from "../controller/authController";
import {
  auth,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  logoutUser,
} from "../service/firebase";

// Mock firebase.ts
jest.mock("../service/firebase", () => ({
  auth: {},
  registerWithEmailAndPassword: jest.fn().mockImplementation(() =>
    Promise.resolve({
      user: {
        uid: "test-uid-123",
        email: "test@example.com",
        getIdToken: jest.fn().mockResolvedValue("mocked-id-token"),
      },
      providerId: "password",
      operationType: "signIn",
    })
  ),
  loginWithEmailAndPassword: jest.fn().mockImplementation(() =>
    Promise.resolve({
      user: {
        uid: "test-uid-123",
        email: "test@example.com",
        getIdToken: jest.fn().mockResolvedValue("mocked-id-token"),
      },
      providerId: "password",
      operationType: "signIn",
    })
  ),
  logoutUser: jest.fn().mockResolvedValue(undefined),
}));

describe("Controller tests:", () => {
  let ctrl: controller;

  beforeAll(() => {
    ctrl = new controller();
  });

  describe("registerWithEmailAndPassword", () => {
    test("should return a Promise with user's data an other things", async () => {
      const result = await ctrl.register("test@example.com", "psw");

      expect(registerWithEmailAndPassword).toHaveBeenCalled();
      expect(result.user).toHaveProperty("uid", "test-uid-123");
      expect(result.user).toHaveProperty("email", "test@example.com");
    });
  });

  describe("loginWithEmailAndPassword", () => {
    test("should return a Promise with user's data an other things", async () => {
      const result = await ctrl.login("test@example.com", "psw");

      expect(loginWithEmailAndPassword).toHaveBeenCalled();
      expect(result.user).toHaveProperty("uid", "test-uid-123");
      expect(result.user).toHaveProperty("email", "test@example.com");
    });
  });

  describe("logoutUser", () => {
    test("should return a empty Promise", async () => {
      const result = await ctrl.logout();

      expect(logoutUser).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
