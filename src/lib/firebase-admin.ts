import * as admin from 'firebase-admin';
//import serviceAccount from '@/lib/secrets/firebase-admin-key.json'; // adjust path if needed
const base64 = process.env.FIREBASE_ADMIN_KEY_BASE64!;
const jsonString = Buffer.from(base64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(jsonString);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const auth = admin.auth();
