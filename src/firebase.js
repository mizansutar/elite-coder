import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQ5_1jWL62CZpwVwCyQ16U43whxDYjlKY",
  authDomain: "elite-code-66fce.firebaseapp.com",
  projectId: "elite-code-66fce",
  storageBucket: "elite-code-66fce.firebasestorage.app",
  messagingSenderId: "164773022225",
  appId: "1:164773022225:web:2471a631ad2b7e2af9bfb0"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);