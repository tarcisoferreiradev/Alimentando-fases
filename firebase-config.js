// ATENÇÃO: USE ESTA SINTAXE PARA FIREBASE V8 (compat)

const firebaseConfig = {
  apiKey: "AIzaSyCUjS5ZmQBJdv5TVBKayG_YIxYgDBFIauo", 
  authDomain: "alimentando-fases.firebaseapp.com",
  projectId: "alimentando-fases",
  storageBucket: "alimentando-fases.firebasestorage.app",
  messagingSenderId: "312896864162",
  appId: "1:312896864162:web:ee61bac2c67b19303dbcfb",
  measurementId: "G-9865RHDG8Z"
};

// 1. Inicializa o aplicativo Firebase (com proteção contra reinicialização)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Se já estiver inicializado, usa a instância existente
}

// 2. Define a variável 'auth' (Login)
const auth = firebase.auth();

// 3. Define a variável 'db' (Banco de Dados Firestore)
const db = firebase.firestore(); 

// 4. Habilitar persistência offline (Recomendado para apps estilo Feed)
// Isso permite que o usuário veja os posts antigos mesmo sem internet
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

// Opcional: Analytics
// const analytics = firebase.analytics();