/**
 * @file developer-console.ts
 * @description Enterprise Branding V8.0 - Localização PT-BR.
 * @author Tarciso
 */

interface SystemCommands {
  ajuda: () => void;
  status: () => void;
  seguranca: () => void;
  contato: () => void;
}

export const initDeveloperConsole = (): void => {
  if (typeof window === 'undefined') return;

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // --- DESIGN SYSTEM ---
  const s = {
    // Logo Tipográfica
    logo: "font-family: 'Segoe UI', sans-serif; font-size: 40px; font-weight: 900; color: #2E7D32; -webkit-text-stroke: 1px #fff; text-shadow: 2px 2px 0px #1B5E20; line-height: 1;",
    
    // Visualização de Fases
    phasesViz: "font-family: monospace; color: #2E7D32; font-size: 16px; letter-spacing: -2px; margin-top: -5px; font-weight: bold;",

    // Subtítulo
    subtitle: "font-family: monospace; font-size: 14px; color: #558B2F; letter-spacing: 2px; margin-bottom: 20px; margin-top: 10px;",
    
    // Etiquetas (Badges)
    badgeGreen: "background: #2E7D32; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; margin-right: 6px;",
    badgeDark: "background: #333; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; margin-right: 6px;",
    
    // Alerta de Segurança
    alertHeader: "background: #D32F2F; color: #fff; padding: 8px 12px; border-radius: 4px; font-weight: 900; font-size: 12px; display: inline-block;",
    alertText: "color: #C62828; font-family: monospace; font-size: 11px; font-weight: bold; margin-top: 8px; line-height: 1.4;",
    
    // Botão
    cmd: "background: #333; color: #00E676; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;"
  };

  // --- SEQUÊNCIA DE INICIALIZAÇÃO ---
  const runBootSequence = async () => {
    console.clear();
    
    // 1. Identidade Visual
    console.log("%cALIMENTANDO FASES", s.logo);
    
    // 2. Jornada Visual
    console.log("%c○───→◉───→● 🌿", s.phasesViz);

    // 3. Subtítulo em PT-BR
    console.log("%cSISTEMA OPERACIONAL DE NUTRIÇÃO v1.2.0", s.subtitle);

    await wait(100);

    // 4. Diagnóstico Técnico (Traduzido)
    console.groupCollapsed("%c DIAGNÓSTICO DO SISTEMA ", "color: #999; font-size: 10px; font-weight: bold;");
    console.log("%cAMBIENTE%cPRODUÇÃO", s.badgeDark, s.badgeGreen);
    console.log("%cNÚCLEO%cReact 18 + TypeScript", s.badgeDark, s.badgeGreen);
    console.log("%cARQUITETURA%cClean Architecture + SOLID", s.badgeDark, s.badgeGreen);
    console.groupEnd();

    await wait(100);

    // 5. Aviso de Segurança
    console.log(`%c🛑 ÁREA DE ACESSO RESTRITO`, s.alertHeader);
    
    console.log(
      `%cEste software é proprietário e protegido por leis internacionais de direitos autorais.\nA engenharia reversa, cópia ou acesso não autorizado ao código-fonte são estritamente proibidos.`,
      s.alertText
    );
    
    console.log(
      `%c> Protocolo de Segurança: TLS 1.3 Ativo\n> Conexão Registrada: IP [::1]\n> ID da Sessão: ${Math.random().toString(36).substring(7).toUpperCase()}`,
      s.alertText
    );

    await wait(200);

    // 6. Convite Interativo (Traduzido)
    console.log(
      `%c\n> Digite %cAF.ajuda()%c para acessar o Painel de Controle.\n`, 
      "color: #555; font-size: 12px;", s.cmd, "color: #555; font-size: 12px;"
    );

    exposeInteractiveAPI();
  };

  // --- API PÚBLICA ---
  const exposeInteractiveAPI = () => {
    const commands: SystemCommands = {
      ajuda: () => {
        console.group('🔓 COMANDOS DO SISTEMA AF');
        console.log('AF.status()    - Ver status detalhado do sistema');
        console.log('AF.seguranca() - Verificação de integridade');
        console.log('AF.contato()   - Canais oficiais');
        console.groupEnd();
      },
      status: () => {
        console.table({
          Sistema: 'Alimentando Fases',
          Fase: 'Crescimento (◉)',
          Status: 'Operacional',
          Renderizacao: 'Client-Side (CSR)'
        });
      },
      seguranca: () => console.log('%c🔒 Integridade do Sistema: VERIFICADA', 'color: green; font-weight: bold; padding: 10px;'),
      contato: () => window.open('https://instagram.com/alimentandofases')
    };
    // @ts-ignore
    window.AF = commands;
  };

  runBootSequence();
};