import * as admin from "firebase-admin";

export class AdminService {
  private static instance: AdminService;
  private adminApp: admin.app.App;

  private constructor() {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    // Initialize only if not already initialized
    if (!admin.apps.length) {
      this.adminApp = admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      });
    } else {
      this.adminApp = admin.apps[0]!;
    }
  }

  /**
   * Get the singleton instance of FirebaseAdminService
   */
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Create a custom authentication token for a user
   */
  public async createAccessToken(
    uid: string,
    customClaims = {}
  ): Promise<string> {
    return admin.auth().createCustomToken(uid, customClaims);
  }

  /**
   * Get the admin instance
   */
  public getAdmin(): typeof admin {
    return admin;
  }
}
