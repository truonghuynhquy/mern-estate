// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-38b68.firebaseapp.com",
  projectId: "mern-estate-38b68",
  storageBucket: "mern-estate-38b68.appspot.com",
  messagingSenderId: "98560234318",
  appId: "1:98560234318:web:02165347cdab6e9a80841f",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
