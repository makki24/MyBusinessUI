// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB_viZtu2MaGEvd93z4RyKVXXtHO_bmv84",
    authDomain: "mybusiness-7478f.firebaseapp.com",
    projectId: "mybusiness-7478f",
    storageBucket: "mybusiness-7478f.appspot.com",
    messagingSenderId: "73959098373",
    appId: "1:73959098373:web:7f22ab557edf32dfac346c",
    measurementId: "G-X9Q8YYWQTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);