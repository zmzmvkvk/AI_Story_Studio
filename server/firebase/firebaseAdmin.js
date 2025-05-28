// server/firebase/firebaseAdmin.js
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL, // .env에서 읽음
  });
}

export const db = getFirestore();
