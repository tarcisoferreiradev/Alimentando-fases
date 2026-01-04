import { MessageController } from './controllers/message.controller.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o controlador principal
    const app = new MessageController();
    app.init();
    
    // Debug
    console.log("Sistema de Mensagens Modular Iniciado 🚀");
});