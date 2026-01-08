/**
 * LOGIN CONTROLLER
 * Responsabilidade: Orquestrar autenticação via Firebase Auth.
 */

// Importa a instância de Auth já inicializada na raiz (Sobe 2 níveis: js -> login -> raiz)
import { auth } from '../../firebase-config.js'; 

// Importa função de Login da CDN
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class LoginController {
    constructor() {
        // Cache DOM Elements
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

    init() {
        if (!this.dom.form) return console.error('Critical: Login Form not found');
        this.dom.form.addEventListener('submit', (e) => this.handleLogin(e));
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (!this.dom.form.checkValidity()) {
            this.dom.form.reportValidity();
            return;
        }

        this.setLoading(true);

        try {
            const email = this.dom.email.value.trim();
            const password = this.dom.password.value;

            // Autenticação via Firebase
            const credential = await signInWithEmailAndPassword(auth, email, password);
            
            console.info(`Auth Success: ${credential.user.uid}`);
            
            // Redirecionamento (Ajuste o caminho conforme necessário)
            window.location.href = '../../dashboard/index.html'; 

        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        this.dom.submitBtn.disabled = isLoading;
        if (isLoading) {
            this.dom.loader.classList.remove('hidden');
            this.dom.btnText.style.opacity = '0';
        } else {
            this.dom.loader.classList.add('hidden');
            this.dom.btnText.style.opacity = '1';
        }
    }

    handleError(error) {
        console.error('Login Error:', error.code);
        
        const messages = {
            'auth/invalid-credential': 'E-mail ou senha incorretos.',
            'auth/user-not-found': 'Usuário não encontrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/too-many-requests': 'Muitas tentativas falhas. Aguarde um momento.',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
        };

        const msg = messages[error.code] || 'Falha ao entrar. Tente novamente.';
        this.showError(msg);
    }

    showError(msg) {
        if (this.dom.modalMessage) this.dom.modalMessage.textContent = msg;
        this.dom.errorModal?.showModal();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new LoginController().init();
});