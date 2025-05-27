import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgBYqnkdG1OOK5sU7a65_2dlOpOa58aAk",
  authDomain: "shorts-web-a00b4.firebaseapp.com",
  projectId: "shorts-web-a00b4",
  storageBucket: "shorts-web-a00b4.firebasestorage.app",
  messagingSenderId: "263559494990",
  appId: "1:263559494990:web:702c6f0b8ee5fbb527321f",
  measurementId: "G-SLRW3CV082",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
