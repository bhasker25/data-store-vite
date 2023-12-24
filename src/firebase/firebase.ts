// src/firebase/firebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBzU0WyMqeEETNRG_cupSfcfKpERm01JM",
    authDomain: "data-store-69e81.firebaseapp.com",
    projectId: "data-store-69e81",
    storageBucket: "data-store-69e81.appspot.com",
    messagingSenderId: "40245803658",
    appId: "1:40245803658:web:cdc65768e75ebd70838b73"
};

// Initialize the App
const app = initializeApp(firebaseConfig);

// Get Firestore reference as db
const db: Firestore = getFirestore(app);

export { db };