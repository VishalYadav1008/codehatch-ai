// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkiH2FL758qr-3DZWb0IP_jlfpJCaN4bg",
  authDomain: "devnest-ai-ce8f8.firebaseapp.com",
  projectId: "devnest-ai-ce8f8",
  storageBucket: "devnest-ai-ce8f8.firebasestorage.app",
  messagingSenderId: "97751298561",
  appId: "1:97751298561:web:a47ae935334cd73a040600",
  measurementId: "G-PXX4M75B3W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);