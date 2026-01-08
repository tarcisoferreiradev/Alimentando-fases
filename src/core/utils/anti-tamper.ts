/**
 * @file anti-tamper.ts
 * @description Proteção contra Cópia e Seleção (Modo Museu).
 * @author Tarciso
 */

export const initSecurityProtocols = (): void => {
  if (typeof window === 'undefined') return;

  // --- TRAVA DE SEGURANÇA (CORRIGIDA) ---
  // Substituímos o "import.meta.env" por uma verificação universal via window.
  // Assim o TypeScript não reclama e funciona em qualquer navegador.
  
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Se for localhost (seu PC), cancela a proteção para você trabalhar em paz.
  // Se for Produção (site no ar), o código continua e ativa os bloqueios.
  if (isLocal) return;

  // 1. Bloqueia o Menu de Contexto (Botão Direito)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Bloqueia Atalhos de Cópia (Mas LIBERA o F12)
  document.addEventListener('keydown', (e) => {
    // Bloqueia Ctrl+C (Copiar)
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+X (Recortar)
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      return false;
    }

    // Bloqueia Ctrl+U (Ver Fonte - mostra o código cru)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Bloqueia Ctrl+S (Salvar Página)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // NOTA: F12 e Ctrl+Shift+I não estão listados aqui,
    // então eles continuam funcionando para ver o Console Bonito.
  });

  // 3. Bloqueia a Seleção de Texto e Arrastar Imagens
  const preventActions = (e: Event) => {
    e.preventDefault();
    return false;
  };

  document.addEventListener('copy', preventActions);      // Não deixa copiar
  document.addEventListener('cut', preventActions);       // Não deixa recortar
  document.addEventListener('dragstart', preventActions); // Não deixa arrastar imagens
  document.addEventListener('selectstart', preventActions); // Não deixa selecionar texto

  // 4. Injeção de CSS (Proteção Visual)
  // Impede que o mouse selecione (pinte de azul) textos e imagens
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    /* Libera interação apenas em campos de digitação */
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);
};