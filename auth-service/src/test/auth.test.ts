import { AuthService } from "../service/firebase";
import * as firebaseAuth from "firebase/auth";

// Mock firebase modules
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => {
  const auth = jest.fn(() => ({
    currentUser: { uid: "test-user-uid" },
  }));

  return {
    getAuth: jest.fn(() => auth()),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };
});

describe("AuthService tests:", () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
  });

  describe("getInstance", () => {
    test("should return the same instance when called multiple times", () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("loginWithEmailAndPassword", () => {
    test("should call signInWithEmailAndPassword with correct parameters", async () => {
      const mockCredential = {
        user: {
          uid: "test-uid",
          email: "test@example.com",
          getIdToken: jest.fn().mockResolvedValue("test-token"),
        },
      };

      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue(
        mockCredential
      );

      const result = await authService.loginWithEmailAndPassword(
        "test@example.com",
        "password123"
      );

      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123"
      );
      expect(result).toBe(mockCredential);
    });

    test("should propagate errors from signInWithEmailAndPassword", async () => {
      const mockError = new Error("Invalid credentials");
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        mockError
      );

      await expect(
        authService.loginWithEmailAndPassword(
          "test@example.com",
          "wrongpassword"
        )
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("registerWithEmailAndPassword", () => {
    test("should call createUserWithEmailAndPassword with correct parameters", async () => {
      const mockCredential = {
        user: {
          uid: "new-test-uid",
          email: "newuser@example.com",
          getIdToken: jest.fn().mockResolvedValue("new-test-token"),
        },
      };

      (
        firebaseAuth.createUserWithEmailAndPassword as jest.Mock
      ).mockResolvedValue(mockCredential);

      const result = await authService.registerWithEmailAndPassword(
        "newuser@example.com",
        "password123"
      );

      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "newuser@example.com",
        "password123"
      );
      expect(result).toBe(mockCredential);
    });

    test("should propagate errors from createUserWithEmailAndPassword", async () => {
      const mockError = new Error("Email already in use");
      (
        firebaseAuth.createUserWithEmailAndPassword as jest.Mock
      ).mockRejectedValue(mockError);

      await expect(
        authService.registerWithEmailAndPassword(
          "existing@example.com",
          "password123"
        )
      ).rejects.toThrow("Email already in use");
    });
  });

  describe("logoutUser", () => {
    test("should call signOut with auth instance", async () => {
      (firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined);

      await authService.logoutUser();

      expect(firebaseAuth.signOut).toHaveBeenCalledWith(expect.anything());
    });

    test("should propagate errors from signOut", async () => {
      const mockError = new Error("Network error");
      (firebaseAuth.signOut as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.logoutUser()).rejects.toThrow("Network error");
    });
  });

  describe("getAuth", () => {
    test("should return the auth instance", () => {
      const auth = authService.getAuth();
      expect(auth).toBeDefined();
      expect(firebaseAuth.getAuth).toHaveBeenCalled();
    });
  });
});
