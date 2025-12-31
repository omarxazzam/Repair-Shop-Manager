import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// إعدادات Firebase الخاصة بتطبيقك
const firebaseConfig = {
  apiKey: "AIzaSyDtkA7unMYwSutGF6Cc_SBepJoYq-uUGIA",
  authDomain: "sale-df7b4.firebaseapp.com",
  projectId: "sale-df7b4",
  storageBucket: "sale-df7b4.firebasestorage.app",
  messagingSenderId: "428262928270",
  appId: "1:428262928270:web:69700f0695b381339a7edf",
  measurementId: "G-N0D71N3YQ0"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تفعيل Analytics فقط في بيئة المتصفح
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// تفعيل Firestore و Authentication
const db = getFirestore(app);
const auth = getAuth(app);

// تصدير الخدمات لاستخدامها في باقي ملفات المشروع
export { app, analytics, db, auth };
