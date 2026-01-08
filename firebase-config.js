/**
 * CONFIGURAÇÃO FIREBASE (MODULAR & CDN)
 * Adaptado para execução nativa no navegador (GitHub Pages / Localhost).
 */

// 1. Imports via CDN (O navegador exige URLs completas)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// 2. Credenciais (Hardcoded para funcionamento sem Build System)
const firebaseConfig = {
  apiKey: "AIzaSyCUjS5ZmQBJdv5TVBKayG_YIxYgDBFIauo",
  authDomain: "alimentando-fases.firebaseapp.com",
  projectId: "alimentando-fases",
  storageBucket: "alimentando-fases.firebasestorage.app",
  messagingSenderId: "312896864162",
  appId: "1:312896864162:web:ee61bac2c67b19303dbcfb",
  measurementId: "G-9865RHDG8Z"
};

// 3. Inicialização
const app = initializeApp(firebaseConfig);

// 4. Exportação dos Serviços (Singleton)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// 5. Persistência Offline (Melhora UX em conexões instáveis)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistência: Múltiplas abas abertas.');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistência não suportada neste navegador.');
    }
});

console.log('Firebase (CDN Mode) initialized.');