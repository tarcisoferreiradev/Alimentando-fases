/**
 * Configuração do Firebase (Padrão Sênior)
 * Utiliza variáveis de ambiente (.env) para proteger as credenciais.
 */

// Importações necessárias para a versão V8 (Compat) no Vite
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Configuração lendo do arquivo .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: "G-9865RHDG8Z" // Analytics ID geralmente é público
};

// 1. Inicialização com padrão Singleton (Evita erro de "App already exists")
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Usa a instância que já foi carregada
}

// 2. Instâncias de Serviços
const auth = firebase.auth();
const db = firebase.firestore();

// 3. Persistência Offline (Mantém o app funcionando sem internet)
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Persistência offline: Múltiplas abas abertas. Apenas uma terá persistência.");
    } else if (err.code === 'unimplemented') {
      console.warn("Persistência offline: Navegador não suporta este recurso.");
    }
  });

// 4. Exportação para uso no restante do App
export { auth, db, firebase };