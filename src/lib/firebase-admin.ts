import * as admin from 'firebase-admin';
import serviceAccount from '@/lib/secrets/firebase-admin-key.json'; // adjust path if needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const auth = admin.auth();
