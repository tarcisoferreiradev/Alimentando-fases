/**
 * LOGIN CONTROLLER
 * Arquitetura: MVC (Controller)
 * * Gerencia o fluxo de autenticação e feedback de UI.
 * Path Resolution: Sobe 3 níveis (controllers -> js -> login -> raiz) para importar config.
 */

import { auth } from '../../../firebase-config.js'; 
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class LoginController {
    constructor() {
        // Cache DOM Elements (Performance Optimization)
        this.dom = {
            form: document.getElementById('loginForm'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            submitBtn: document.getElementById('btnSubmit'),
            loader: document.querySelector('.btn-loader'),
            btnText: document.querySelector('.btn-text'),
            errorModal: document.getElementById('errorModal'),
            modalMessage: document.getElementById('modalDesc')
        };
    }

    /**
     * Inicializa listeners de eventos.
     */
    init() {
        if (!this.dom.form) return console.error('Critical: Login DOM binding failed');
        this.dom.form.addEventListener('submit', (e) => this.handleLogin(e));
    }

    /**
     * Handler assíncrono de login.
     * @param {Event} e 
     */
    async handleLogin(e) {
        e.preventDefault();
        
        if (!this.validateConstraints()) return;

        this.setLoading(true);

        try {
            const credential = await signInWithEmailAndPassword(
                auth, 
                this.dom.email.value.trim(), 
                this.dom.password.value
            );
            
            this.handleSuccess(credential.user);

        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Validação HTML5 Constraint API.
     */
    validateConstraints() {
        if (!this.dom.form.checkValidity()) {
            this.dom.form.reportValidity();
            return false;
        }
        return true;
    }

    /**
     * Gerenciamento de estado de UI (Loading/Idle).
     * @param {boolean} active 
     */
    setLoading(active) {
        this.dom.submitBtn.disabled = active;
        this.dom.loader.classList.toggle('hidden', !active);
        this.dom.btnText.style.opacity = active ? '0' : '1';
    }

    handleSuccess(user) {
        console.info(`Auth: Session established for ${user.uid}`);
        // Redirecionamento seguro (Sobe 3 níveis para a raiz -> dashboard)
        window.location.href = '../../../dashboard/index.html';
    }

    /**
     * Tratamento de erros tipados do Firebase Auth.
     */
    handleError(error) {
        console.error(`Auth Failure: ${error.code}`);
        
        const errorMap = {
            'auth/invalid-credential': 'E-mail ou senha incorretos.',
            'auth/user-not-found': 'Usuário não encontrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/too-many-requests': 'Muitas tentativas. Aguarde instantes.',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
        };

        const msg = errorMap[error.code] || 'Falha ao autenticar. Tente novamente.';
        this.showModal(msg);
    }

    showModal(msg) {
        if (this.dom.modalMessage) this.dom.modalMessage.textContent = msg;
        this.dom.errorModal?.showModal();
    }
}

// Inicialização Autônoma
document.addEventListener('DOMContentLoaded', () => {
    new LoginController().init();
});