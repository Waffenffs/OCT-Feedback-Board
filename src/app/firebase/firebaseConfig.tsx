import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDKZPGp_PtcLSYdlU4m72DHJBLcjHlZiCw",
    authDomain: "oct-feedback-board.firebaseapp.com",
    projectId: "oct-feedback-board",
    storageBucket: "oct-feedback-board.appspot.com",
    messagingSenderId: "582814095757",
    appId: "1:582814095757:web:edb0e5ce0972335742c5c4",
    measurementId: "G-G9HCYX4CXV",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
