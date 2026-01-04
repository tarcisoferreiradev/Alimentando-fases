import { UIController } from './controllers/ui.controller.js';
import { FeedController } from './controllers/feed.controller.js';
import { PostController } from './controllers/post.controller.js';
import { PostDetailController } from './controllers/post-detail.controller.js';
import { EditorController } from './controllers/editor.controller.js';
import { UsdaController } from './controllers/usda.controller.js';
import { Calculators } from './utils/calculators.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("Sistema Comunidade: Inicializando...");

        // Interface Geral
        const ui = new UIController();
        ui.init();

        // Editor de Imagens
        const editor = new EditorController();
        editor.init();

        // Posts (Criação)
        const postCtrl = new PostController(editor);
        postCtrl.init();

        // Detalhes do Post (Modal tipo Instagram)
        const postDetail = new PostDetailController();
        postDetail.init();

        // Feed Principal
        const feed = new FeedController();
        feed.init();

        // Integração USDA (FoodData Central)
        const usda = new UsdaController();
        usda.init();

        // Utilitários (Calculadoras simples de UI)
        if (Calculators && typeof Calculators.init === 'function') {
            Calculators.init();
        }

        // Eventos Globais
        document.addEventListener('post-created', () => {
            feed.loadFeed();
        });

    } catch (error) {
        console.error("Erro crítico na inicialização:", error);
    }
});