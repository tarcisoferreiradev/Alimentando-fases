/**
 * LOGIN CONTROLLER
 * Camada: Controller (MVC)
 * Responsabilidade: Orquestração da autenticação e manipulação do DOM.
 */

// Importa config da raiz (Sobe 3 níveis: controllers -> js -> login -> raiz)
import { auth } from '../../../firebase-config.js'; 
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class LoginController {
    constructor() {
        // Mapeamento dos elementos do DOM para acesso rápido
        this.dom = {
            form: document.getElementById('loginForm'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            submitBtn: document.getElementById('btnSubmit'),
            // Loader opcional interno, caso o CSS use apenas a classe .loading no botão
            loaderIcon: document.querySelector('.btn-loader'), 
            errorModal: document.getElementById('errorModal'),
            modalMessage: document.getElementById('modalDesc')
        };
    }

    /**
     * Inicializa os listeners da aplicação.
     */
    init() {
        if (!this.dom.form) {
            console.error('Critical Error: Elemento #loginForm não encontrado no DOM.');
            return;
        }
        
        this.dom.form.addEventListener('submit', (e) => this.handleLogin(e));
    }

    /**
     * Processa a submissão do formulário de login.
     * @param {Event} e Evento de submit
     */
    async handleLogin(e) {
        e.preventDefault();
        
        // Validação HTML5 Nativa
        if (!this.dom.form.checkValidity()) {
            this.dom.form.reportValidity();
            return;
        }

        this.setLoading(true);

        try {
            const email = this.dom.email.value.trim();
            const password = this.dom.password.value;

            // Chamada ao serviço de Autenticação
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            console.info(`Auth Success: User ${userCredential.user.uid} logged in.`);
            
            // Redirecionamento (Sobe 3 níveis para encontrar a dashboard na raiz)
            window.location.href = '../../../dashboard/index.html'; 

        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Gerencia o estado visual de carregamento.
     * Adiciona classe .loading para integração com o CSS existente.
     * @param {boolean} isLoading 
     */
    setLoading(isLoading) {
        if (isLoading) {
            this.dom.submitBtn.classList.add('loading');
            this.dom.submitBtn.disabled = true;
            if (this.dom.loaderIcon) this.dom.loaderIcon.classList.remove('hidden');
        } else {
            this.dom.submitBtn.classList.remove('loading');
            this.dom.submitBtn.disabled = false;
            if (this.dom.loaderIcon) this.dom.loaderIcon.classList.add('hidden');
        }
    }

    /**
     * Trata erros retornados pelo Firebase Auth.
     * @param {Error} error Objeto de erro do Firebase
     */
    handleAuthError(error) {
        console.error('Auth Error:', error.code);
        
        let message = 'Ocorreu um erro ao tentar entrar.';
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'E-mail ou senha incorretos.';
                break;
            case 'auth/too-many-requests':
                message = 'O acesso a esta conta foi temporariamente desativado devido a muitas tentativas falhas de login. Tente novamente mais tarde.';
                break;
            case 'auth/network-request-failed':
                message = 'Erro de conexão. Verifique sua internet.';
                break;
        }

        this.showErrorModal(message);
    }

    showErrorModal(message) {
        if (this.dom.modalMessage) {
            this.dom.modalMessage.textContent = message;
        }
        if (this.dom.errorModal) {
            this.dom.errorModal.showModal();
        } else {
            alert(message); // Fallback caso o modal não exista
        }
    }
}

// Inicialização automática ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    const controller = new LoginController();
    controller.init();
});