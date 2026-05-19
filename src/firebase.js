// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCCIONES: Reemplazá los valores de abajo con los de tu proyecto Firebase.
// Los encontrás en: Firebase Console → tu proyecto → ⚙️ Configuración → Aplicaciones web
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyCwDG7UMEx0rLGiz5f2Ru0Z9AJR2PGEtGE",
  authDomain:        "calculadora-papeleria-rincon.firebaseapp.com",
  projectId:         "calculadora-papeleria-rincon",
  storageBucket:     "calculadora-papeleria-rincon.firebasestorage.app",
  messagingSenderId: "229846430633",
  appId:             "1:229846430633:web:a8d4f7d50077bac9460ab8",
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const loginConGoogle = () => signInWithPopup(auth, googleProvider);
export const cerrarSesion   = () => signOut(auth);
export const onLogin        = (cb) => onAuthStateChanged(auth, cb);

// ── Firestore helpers ─────────────────────────────────────────────────────────
// Todos los datos del usuario se guardan en un único documento:
// /usuarios/{uid}/datos/app

export async function guardarEnNube(uid, datos) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "usuarios", uid, "datos", "app"), datos);
  } catch (e) {
    console.error("Error guardando en nube:", e);
  }
}

export async function cargarDesdeNube(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "usuarios", uid, "datos", "app"));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Error cargando desde nube:", e);
    return null;
  }
}

export function escucharCambios(uid, callback) {
  if (!uid) return () => {};
  return onSnapshot(
    doc(db, "usuarios", uid, "datos", "app"),
    (snap) => { if (snap.exists()) callback(snap.data()); },
    (err) => console.error("Error listener:", err)
  );
}
