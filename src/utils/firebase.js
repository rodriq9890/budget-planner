import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export async function signUpWithEmail(email, password, name) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    if (name) {
      await updateProfile(result.user, { displayName: name })
    }
    return { user: result.user, error: null }
  } catch (error) {
    let message = "Something went wrong"
    if (error.code === "auth/email-already-in-use") message = "An account with this email already exists"
    if (error.code === "auth/weak-password") message = "Password must be at least 6 characters"
    if (error.code === "auth/invalid-email") message = "Invalid email address"
    return { user: null, error: message }
  }
}

export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error) {
    let message = "Something went wrong"
    if (error.code === "auth/invalid-credential") message = "Invalid email or password"
    if (error.code === "auth/user-not-found") message = "No account found with this email"
    if (error.code === "auth/wrong-password") message = "Incorrect password"
    if (error.code === "auth/too-many-requests") message = "Too many attempts. Try again later"
    return { user: null, error: message }
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