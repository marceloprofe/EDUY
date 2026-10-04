import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { getFunctions } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js";

const firebaseConfig = {
    apiKey: "AIzaSyAvSqMKe1qdoLaSdBJ5SY5kYfNckF98NtE",
    authDomain: "eduy-d6421.firebaseapp.com",
    projectId: "eduy-d6421",
    storageBucket: "eduy-d6421.firebasestorage.app",
    messagingSenderId: "412902128889",
    appId: "1:412902128889:web:85ece55f9d9b923f08f628"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "southamerica-east1");

// Una segunda instancia evita que crear una cuenta nueva cierre la sesión
// del administrador autenticado en la instancia principal.
const appAltaUsuario = initializeApp(firebaseConfig, "alta-usuario-admin");
const authAltaUsuario = getAuth(appAltaUsuario);

export { auth, authAltaUsuario, db, functions };
