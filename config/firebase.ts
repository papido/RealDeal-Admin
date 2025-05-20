// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq3HbrlQWIhRkempuXSpVmpFJhrh4qmBc",
  authDomain: "realdeal-f46e1.firebaseapp.com",
  projectId: "realdeal-f46e1",
  storageBucket: "realdeal-f46e1.firebasestorage.app",
  messagingSenderId: "39342535560",
  appId: "1:39342535560:web:783131fb15fbc84552403d",
  measurementId: "G-3PV9XNXE8G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

//auth
export const auth = getAuth(app);

//db
export const firestore = getFirestore(app);
