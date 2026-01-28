// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8arZPT_Dr30ts9rak9hsMp-MJA8VQFdk",
  authDomain: "tabletop-oz.firebaseapp.com",
  databaseURL: "https://tabletop-oz-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tabletop-oz",
  storageBucket: "tabletop-oz.firebasestorage.app",
  messagingSenderId: "743043893766",
  appId: "1:743043893766:web:03368168fe796fd3405187",
  measurementId: "G-1RHJCL9HD4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
