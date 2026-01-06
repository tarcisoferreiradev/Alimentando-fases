/**
 * Configuração do Firebase
 * Adaptada para usar variáveis de ambiente (Segurança)
 */
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// AQUI ESTÁ O SEGREDO:
// Em vez de escrever a senha ("AIza..."), mandamos o código ler do arquivo .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: "G-9865RHDG8Z" // O ID do Analytics geralmente é público, não tem problema
};

// Inicialização do App (Padrão Singleton para evitar erros de dupla inicialização)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Se já existe, usa a instância carregada
}

// Exporta as funcionalidades para usar no resto do site
const auth = firebase.auth();
const db = firebase.firestore();

// Habilita persistência offline (opcional, mas recomendado)
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistência falhou: Múltiplas abas abertas.');
    } else if (err.code === 'unimplemented') {
        console.warn('O navegador não suporta persistência.');
    }
});

export { auth, db, firebase };