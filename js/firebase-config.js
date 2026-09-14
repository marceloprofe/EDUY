import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

    import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFpjAUhEhsYD4nHrBl5dUYVWun0Y0OeSI",
  authDomain: "eduy-b8d33.firebaseapp.com",
  projectId: "eduy-b8d33",
  storageBucket: "eduy-b8d33.firebasestorage.app",
  messagingSenderId: "392724675033",
  appId: "1:392724675033:web:9a4e97dfff5043fe6841c8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
