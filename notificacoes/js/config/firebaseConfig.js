/**
 * Infrastructure Layer: Firebase Configuration
 * Responsabilidade: Inicialização segura e centralizada do SDK (Compat v9).
 * Padrão: Singleton.
 */
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js";

const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Prevenção de reinicialização em Hot Reloading ou navegação SPA
const app = !firebase.apps.length 
    ? firebase.initializeApp(firebaseConfig) 
    : firebase.app();

const auth = app.auth();
const db = app.firestore();

// Habilita persistência de cache para UX offline-first
db.enablePersistence().catch(err => {
    if (err.code == 'failed-precondition') {
        console.warn('[Persistence] Múltiplas abas abertas.');
    } else if (err.code == 'unimplemented') {
        console.warn('[Persistence] Navegador não suportado.');
    }
});

export { auth, db, firebase };