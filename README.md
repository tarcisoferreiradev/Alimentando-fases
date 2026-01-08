# 🌿 Alimentando Fases (AF) — Sistema Nutricional

[![Stack](https://img.shields.io/badge/Stack-React_19_%7C_TS_%7C_Firebase-2E7D32)](https://github.com/tarxdev)
[![Architecture](https://img.shields.io/badge/Architecture-Clean_&_SOLID-558B2F)](https://github.com/tarxdev)
[![Security](https://img.shields.io/badge/Security-Anti--Tamper_Enabled-D32F2F)](#-seguranca-e-integridade)

O **Alimentando Fases** é uma plataforma híbrida de alta performance dedicada à educação nutricional. O sistema combina a agilidade de páginas estáticas otimizadas com a robustez de um SPA (Single Page Application) desenvolvido em React 19, focado em entregabilidade **Mobile-First** e experiência de usuário **Dark Luxury**.

---

## 🏗️ Arquitetura e Stack Técnica

O projeto foi construído sob os princípios de **Clean Architecture** e **SOLID**, garantindo baixo acoplamento e separação clara de responsabilidades (SoC).

* **Core:** [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/) (Strict Mode).
* **Build System:** [Vite](https://vitejs.dev/) (Otimizado para Web Vitals).
* **BaaS (Backend as a Service):** [Firebase 12](https://firebase.google.com/) (Auth, Firestore, Analytics).
* **UI/UX:** Design System customizado "Dark Luxury" com suporte a badges dinâmicas e modais reativos.

---

## 📂 Estrutura do Projeto

A organização segue o padrão de separação por domínios e responsabilidades críticas:

```bash
├── admin/               # Gestão de cargos e moderação (Master/Nutri)
├── perfil/              # Módulo de perfil com design 'Luxury' e reatividade
├── notificacoes/        # Central de alertas e calculadoras biométricas (IMC/Água)
├── sistema-cargos/      # Motor de renderização de insígnias e Design System
├── src/
│   ├── core/
│   │   └── utils/       # Protocolos Anti-tamper e Developer-Console
│   ├── main.tsx         # Orquestração de boot e segurança (Entry Point)
│   └── App.tsx          # Router e inicialização de componentes
├── tsconfig.json        # Configuração estrita de compilação TS
└── package.json         # Manifesto de dependências e scripts de build