import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logoutUser,
} from "../service/firebase";

export class controller {
  async login(email: string, password: string) {
    return await loginWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string) {
    return await registerWithEmailAndPassword(email, password);
  }

  async logout() {
    return await logoutUser();
  }
}
