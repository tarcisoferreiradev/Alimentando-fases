/**
 * CONFIGURAÇÃO CENTRAL DO FIREBASE
 * Padrão: Compatibilidade (V8) + Persistência Offline
 */

// 1. IMPORTS NECESSÁRIOS (Para o Vite entender o que é "firebase")
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

// 2. CONFIGURAÇÃO (Lendo do .env para segurança)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// 3. INICIALIZAÇÃO (Com proteção contra duplicidade)
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// 4. EXPORTA AS VARIÁVEIS DO SISTEMA
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// 5. LÓGICA DE PERSISTÊNCIA OFFLINE (A parte que faltava!)
// Isso permite que o usuário veja os dados mesmo sem internet.
db.enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          // Falha se houver múltiplas abas abertas ao mesmo tempo
          console.warn("Persistência offline falhou: Múltiplas abas abertas.");
      } else if (err.code == 'unimplemented') {
          // O navegador não suporta
          console.warn("Persistência offline não suportada neste navegador.");
      }
  });

// Exporta tudo para ser usado nos outros arquivos
export { firebase, auth, db, analytics };