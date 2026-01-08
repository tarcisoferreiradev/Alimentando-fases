import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// O import do CSS global costuma ficar aqui, se você tiver (ex: index.css)
// import './index.css'; 

// --- MÓDULOS DO SISTEMA (CORE) ---
// 1. Branding: O console "hackerman" bonito
import { initDeveloperConsole } from './core/utils/developer-console';

// 2. Segurança: Proteção contra F12 e cópias (Modo Museu)
import { initSecurityProtocols } from './core/utils/anti-tamper';

// --- INICIALIZAÇÃO ---
// Executa os scripts de segurança antes mesmo do React carregar a tela
initDeveloperConsole();
initSecurityProtocols();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);