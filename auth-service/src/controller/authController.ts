import { AuthService } from "../service/firebase";

export class controller {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  async login(email: string, password: string) {
    return await this.authService.loginWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string) {
    return await this.authService.registerWithEmailAndPassword(email, password);
  }

  async logout() {
    return await this.authService.logoutUser();
  }
}
