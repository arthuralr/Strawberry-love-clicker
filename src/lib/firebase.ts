// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsnPiTuc1JBOPaZhvCNjofwgF-E_gHgbk",
  authDomain: "morango-642fc.firebaseapp.com",
  databaseURL: "https://morango-642fc-default-rtdb.firebaseio.com",
  projectId: "morango-642fc",
  storageBucket: "morango-642fc.firebasestorage.app",
  messagingSenderId: "720723303481",
  appId: "1:720723303481:web:d85cd6aa06ac6e861bc1e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
