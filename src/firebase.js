// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCCIONES: Reemplazá los valores de abajo con los de tu proyecto Firebase.
// Los encontrás en: Firebase Console → tu proyecto → ⚙️ Configuración → Aplicaciones web
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "PEGAR_AQUI_TU_apiKey",
  authDomain:        "PEGAR_AQUI_TU_authDomain",
  projectId:         "PEGAR_AQUI_TU_projectId",
  storageBucket:     "PEGAR_AQUI_TU_storageBucket",
  messagingSenderId: "PEGAR_AQUI_TU_messagingSenderId",
  appId:             "PEGAR_AQUI_TU_appId",
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
