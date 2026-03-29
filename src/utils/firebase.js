import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAYTzJcW-np6LlWGYpIklBM6BrQTxCVDHo",
  authDomain: "budget-planner-9890.firebaseapp.com",
  projectId: "budget-planner-9890",
  storageBucket: "budget-planner-9890.firebasestorage.app",
  messagingSenderId: "1037871496243",
  appId: "1:1037871496243:web:a872e4d29212ea5ab4f746",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error("Sign in error:", error)
    return null
  }
}

export async function signOutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Sign out error:", error)
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

// Save budget data to Firestore
export async function saveBudgetData(userId, data) {
  try {
    await setDoc(doc(db, "budgets", userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Save error:", error)
  }
}

// Load budget data from Firestore
export async function loadBudgetData(userId) {
  try {
    const snapshot = await getDoc(doc(db, "budgets", userId))
    if (snapshot.exists()) {
      return snapshot.data()
    }
    return null
  } catch (error) {
    console.error("Load error:", error)
    return null
  }
}