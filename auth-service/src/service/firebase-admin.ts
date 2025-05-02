import * as admin from "firebase-admin";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "dma-internship-project",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Solo se non già inizializzata
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

// Genera l'access token
export const createAccessToken = async (uid: string, customClaims = {}) => {
  return admin.auth().createCustomToken(uid, customClaims);
};

export { admin };
