/**
 * FIREBASE CONFIGURATION (CDN MODE)
 * Contexto: Infraestrutura / Singleton
 * * Configuração adaptada para execução direta no navegador (GitHub Pages/Localhost).
 * Elimina dependência de bundlers (Vite/Webpack) e variáveis de ambiente (Node.js).
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Credenciais estáticas para Runtime Client-Side
const firebaseConfig = {
  apiKey: "AIzaSyCUjS5ZmQBJdv5TVBKayG_YIxYgDBFIauo",
  authDomain: "alimentando-fases.firebaseapp.com",
  projectId: "alimentando-fases",
  storageBucket: "alimentando-fases.firebasestorage.app",
  messagingSenderId: "312896864162",
  appId: "1:312896864162:web:ee61bac2c67b19303dbcfb",
  measurementId: "G-9865RHDG8Z"
};

// Inicialização Singleton
const app = initializeApp(firebaseConfig);

// Exportação de Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Persistência Offline (Resiliência de Conexão)
enableIndexedDbPersistence(db).catch((err) => {
    // Silencia erros de múltiplas abas abertas em dev
    if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
        console.warn('Persistence Error:', err);
    }
});

console.info('Firebase Core Services Initialized (CDN Mode)');