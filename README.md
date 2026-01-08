# Alimentando Fases (AF) — Technical Documentation

## 1. Executive Summary
Ecossistema híbrido de alto desempenho focado em conteúdo educativo nutricional. A arquitetura é composta por uma camada de páginas estáticas otimizadas para SEO e um **Single Page Application (SPA)** robusto desenvolvido em **React + TypeScript**. O backend é orquestrado via **Firebase (BaaS)**, garantindo persistência reativa, autenticação federada e segurança em nível de documento.

## 2. Arquitetura e Padrões de Design
O projeto adota princípios de **Clean Architecture** e **SOLID** para garantir baixo acoplamento e alta testabilidade:

* **SoC (Separation of Concerns)**: Divisão clara entre camadas de transporte de dados (Services), lógica de controle (Controllers) e renderização (Components).
* **Resiliência**: Implementação de *Early Return* para redução de complexidade ciclomática e *Error Boundaries* para isolamento de falhas na UI.
* **Segurança**: Camada de lógica *Anti-Tamper* no core da aplicação para proteção de regras de negócio sensíveis.
* **Mobile-First**: Design Responsivo baseado em um sistema de design "Dark Luxury", priorizando a experiência em dispositivos móveis.

## 3. Stack Tecnológica
| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Core Engine** | React 18 + TypeScript | Interface declarativa com tipagem estrita. |
| **Build Tool** | Vite | Bundling de alta performance e Hot Module Replacement (HMR). |
| **Infrastructure** | Firebase (Firestore/Auth) | Persistência de dados e gestão de identidade. |
| **Páginas Estáticas** | HTML5 / CSS3 / ES6+ | Entrega de conteúdo de baixa latência e otimização de LCP. |

## 4. Estrutura do Projeto
```bash
├── notificacoes/          # Módulo de mensageria (MVC Pattern)
│   ├── js/controllers/    # Orquestração de eventos e fluxo
│   ├── js/services/       # Interface de comunicação com Firestore
│   └── js/config/         # Injeção de dependência e setup Firebase
├── perfil/                # Módulo de gestão de perfis e badges de autoridade
├── src/                   # Core SPA (React/TS)
│   ├── core/              # Utilitários críticos (Security, Logger, Console)
│   └── components/        # UI Components desacoplados
├── dist/                  # Artefatos otimizados para produção (ignorado no Git)
└── package.json           # Manifesto de dependências e scripts