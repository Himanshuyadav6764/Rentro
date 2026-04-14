import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getServiceAccount(): ServiceAccount {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (rawJson) {
    const parsed = JSON.parse(rawJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or individual Firebase env vars.",
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

let app: App | null = null;

function getFirebaseAdminApp(): App {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const serviceAccount = getServiceAccount();

  app = initializeApp({
    credential: cert({
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey,
    }),
  });

  return app;
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
